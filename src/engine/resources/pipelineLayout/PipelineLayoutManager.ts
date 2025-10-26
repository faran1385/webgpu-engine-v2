import {fnv1aHash} from "../../../helpers/globalHelpler.ts";
import type {ManagerCreateEntries} from "../pipeline/pipeline.types.ts";
import GPURawPipelineLayout from "./GPURawPipelineLayout.ts";
import {PipelineLayoutTracker} from "../../core/tracking/pipelineLayoutTracker/pipelineLayoutTracker.ts";
import DeviceManager from "../../core/DeviceManager.ts";
import ResourceUpdater from "../../core/resourceUpdater/ResourceUpdater.ts";

export default class PipelineLayoutManager {
    private static _instance: PipelineLayoutManager;
    private cache: Map<string, {
        wrapperClasses: Map<string, GPURawPipelineLayout>,
        tracker: PipelineLayoutTracker
    }> = new Map();

    private constructor() {
    }

    public static init() {
        if (!this._instance) {
            this._instance = new PipelineLayoutManager();
        }
        return this._instance
    }


    removeResource(hash: string, nanoId: string) {
        const map = this.cache.get(hash);
        if (map) {
            map.wrapperClasses.delete(nanoId)
            if (map.wrapperClasses.size <= 0) this.cache.delete(hash)
        }
    }

    createGPUPipelineLayout(T: {
        bindgroupLayouts: ManagerCreateEntries["bindgroupLayouts"],
        layoutLabel?: ManagerCreateEntries["layoutLabel"],
    }) {
        const device = DeviceManager.instance.device
        return device.createPipelineLayout({
            label: T.layoutLabel,
            bindGroupLayouts: T.bindgroupLayouts.map((i) => i.getTracker().getGPUResource())
        })
    }

    getCachedInfoByHash(hash: string) {
        return this.cache.get(hash);
    }

    createOrGetTracker(hash: string, wrapperClass: GPURawPipelineLayout) {
        if (this.cache.has(hash)) {
            const cachedData = this.cache.get(hash)!;
            cachedData.wrapperClasses.set(wrapperClass.getNanoID(), wrapperClass)
            ResourceUpdater.init().removeIndestructiveFromDeleteQueue(wrapperClass);

            return cachedData.tracker;
        }

        const data = {
            label: wrapperClass.getUpdateTo()?.label ?? wrapperClass.getLabel(),
            boundedBindGroups: wrapperClass.getUpdateTo()?.boundedBindGroupLayouts ?? wrapperClass.getBoundedBindGroups()
        }

        const newPipelineLayout = this.createGPUPipelineLayout({
            layoutLabel: data.label,
            bindgroupLayouts: data.boundedBindGroups
        })

        const tracker = new PipelineLayoutTracker(hash, newPipelineLayout);

        this.cache.set(hash, {
            wrapperClasses: new Map([[wrapperClass.getNanoID(), wrapperClass]]),
            tracker
        })

        return tracker;
    }

    compileHash(T: ManagerCreateEntries["bindgroupLayouts"]) {
        return fnv1aHash(T.map(i => `${i.getNanoID()}${i.getTracker().getHash()}`).join(""))
    }

    createPipelineLayout(T: {
        bindgroupLayouts: ManagerCreateEntries["bindgroupLayouts"],
        layoutLabel?: ManagerCreateEntries["layoutLabel"],
    }) {
        const hash = this.compileHash(T.bindgroupLayouts)

        const cachedData = this.cache.get(hash);

        if (cachedData && cachedData.wrapperClasses.size > 0) {
            const clone = Array.from(cachedData.wrapperClasses)[0][1].clone(T.bindgroupLayouts);
            cachedData.wrapperClasses.set(clone.getNanoID(), clone);
            this.setPipelineLayoutRelations(T.bindgroupLayouts, clone)

            return clone;
        }
        const gpuPipelineLayout = this.createGPUPipelineLayout(T)
        const tracker = new PipelineLayoutTracker(hash, gpuPipelineLayout);

        const layout = new GPURawPipelineLayout({
            label: T.layoutLabel,
            tracker,
            bindgroupLayouts: T.bindgroupLayouts,
        });

        this.setPipelineLayoutRelations(T.bindgroupLayouts, layout)
        this.cache.set(hash, {
            wrapperClasses: new Map([[layout.getNanoID(), layout]]),
            tracker
        });
        return layout;
    }

    private setPipelineLayoutRelations(bindgroupLayouts: ManagerCreateEntries["bindgroupLayouts"], layout: GPURawPipelineLayout) {
        bindgroupLayouts.forEach((i) => {
            i.addChild(layout)
            layout.addParent(i)
        })
    }


}