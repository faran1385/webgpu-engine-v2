import {getLayoutEntries, hashBindgroupLayout} from "../../../helpers/bindgroupHelper.ts";
import GPURawBindgroupLayout from "../bindgroupLayout/GPURawBindgroupLayout.ts";
import {BindgroupLayoutTracker} from "../../core/tracking/bindgroupLayoutTracker/bindgroupLayoutTracker.ts";
import DeviceManager from "../../core/DeviceManager.ts";
import type {LayoutManagerCreateEntries} from "./bindgroupLayout.types.ts";
import {convertRecordToArray} from "../../../helpers/globalHelpler.ts";
import ResourceUpdater from "../../core/resourceUpdater/ResourceUpdater.ts";


export default class BindgroupLayoutManager {
    private static _instance: BindgroupLayoutManager;

    private cache: Map<string, {
        wrapperClasses: Map<string, GPURawBindgroupLayout>,
        tracker: BindgroupLayoutTracker
    }> = new Map();

    private constructor() {
    }

    hashExists(hash: string) {
        return this.cache.has(hash);
    }

    getCachedInfoByHash(hash: string) {
        return this.cache.get(hash);
    }

    addToCache(newHash: string, data: {
        wrapperClasses: Map<string, GPURawBindgroupLayout>,
        tracker: BindgroupLayoutTracker
    }) {
        this.cache.set(newHash, data)
    }

    compileHash(layout: Record<string, GPUBindGroupLayoutEntry>) {
        return hashBindgroupLayout(layout)
    }

    createGPULayout(label: string | undefined, entries: GPUBindGroupLayoutEntry[]) {
        const device = DeviceManager.instance.device

        return device.createBindGroupLayout({
            entries,
            label
        })
    }

    createOrGetTracker(hash: string, wrapperClass: GPURawBindgroupLayout) {
        if (this.cache.has(hash)) {
            const cachedData = this.cache.get(hash)!;
            cachedData.wrapperClasses.set(wrapperClass.getNanoID(), wrapperClass)
            ResourceUpdater.init().removeIndestructiveFromDeleteQueue(wrapperClass);
            return cachedData.tracker;

        }
        const data = {
            label: wrapperClass.getUpdateTo()?.label ?? wrapperClass.getLabel(),
            entries: wrapperClass.getUpdateTo()?.entries ?? wrapperClass.getLayoutEntries()
        }

        const newBindgroupLayout = this.createGPULayout(data.label, data.entries)
        const tracker = new BindgroupLayoutTracker(hash, newBindgroupLayout);

        this.cache.set(hash, {
            wrapperClasses: new Map<string, GPURawBindgroupLayout>([[wrapperClass.getNanoID(), wrapperClass]]),
            tracker
        })

        return tracker;
    }


    createLayout(T: LayoutManagerCreateEntries) {
        const layoutEntries = getLayoutEntries(T.resources)
        const hash = hashBindgroupLayout(layoutEntries);
        const cachedData = this.cache.get(hash);

        if (cachedData && cachedData.wrapperClasses.size > 0) {
            const clone = Array.from(cachedData.wrapperClasses)[0][1].clone();
            cachedData.wrapperClasses.set(clone.getNanoID(), clone);

            return clone;
        }
        const tracker = new BindgroupLayoutTracker(hash, this.createGPULayout(T.layoutLabel, convertRecordToArray(layoutEntries)));

        const layout = new GPURawBindgroupLayout({
            isCopy: false,
            entries: getLayoutEntries(T.resources),
            label: T.layoutLabel,
            tracker
        });

        this.cache.set(hash, {
            wrapperClasses: new Map([[layout.getNanoID(), layout]]),
            tracker
        });
        return layout;
    }

    removeResource(hash: string, nanoId: string) {
        const map = this.cache.get(hash);
        if (map) {
            map.wrapperClasses.delete(nanoId)
            if (map.wrapperClasses.size <= 0) this.cache.delete(hash)
        }
    }


    public static init() {
        if (!this._instance) {
            this._instance = new BindgroupLayoutManager();
        }

        return this._instance
    }
}