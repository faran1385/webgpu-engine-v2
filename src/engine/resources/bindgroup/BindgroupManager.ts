import type {
    EntryResource,
    GPUBindGroupManagerCreateEntries
} from "./bindgroup.types.ts";
import GPURawBuffer from "../buffer/GPURawBuffer.ts";
import {GPURawTexture} from "../texture/GPURawTexture.ts";
import {convertRecordToArray, fnv1aHash} from "../../../helpers/globalHelpler.ts";
import GPURawBindgroupLayout from "../bindgroupLayout/GPURawBindgroupLayout.ts";
import GPURawBindgroup from "./GPURawBindgroup.ts";
import BindgroupLayoutManager from "../bindgroupLayout/BindgroupLayoutManager.ts";
import {BindgroupTracker} from "../../core/tracking/bindgroupTracker/bindgroupTracker.ts";
import DeviceManager from "../../core/DeviceManager.ts";
import {getResourcesWidthBinding} from "../../../helpers/bindgroupHelper.ts";
import ResourceUpdater from "../../core/resourceUpdater/ResourceUpdater.ts";


export default class BindgroupManager {
    private static _instance: BindgroupManager;
    private cache: Map<string, {
        wrapperClasses: Map<string, GPURawBindgroup>,
        tracker: BindgroupTracker
    }> = new Map();
    private layoutManager: BindgroupLayoutManager

    private constructor() {
        this.layoutManager = BindgroupLayoutManager.init();
    }


    hashExists(hash: string) {
        return this.cache.has(hash);
    }


    removeResource(hash: string, nanoId: string) {
        const map = this.cache.get(hash);
        if (map) {
            map.wrapperClasses.delete(nanoId)
            if (map.wrapperClasses.size <= 0) this.cache.delete(hash)
        }
    }

    createOrGetTracker(hash: string, wrapperClass: GPURawBindgroup) {
        if (this.cache.has(hash)) {
            const cachedData = this.cache.get(hash)!;
            cachedData.wrapperClasses.set(wrapperClass.getNanoID(), wrapperClass)
            ResourceUpdater.init().removeIndestructiveFromDeleteQueue(wrapperClass);

            return cachedData.tracker;
        }
        const data = {
            label: wrapperClass.getUpdateTo()?.label ?? wrapperClass.getLabel(),
            entries: wrapperClass.getUpdateTo()?.entries ?? wrapperClass.getEntries()
        }

        const newBindgroup = this.createGPUBindgroup(data.label, wrapperClass.getLayout(), data.entries)
        const tracker = new BindgroupTracker(hash, newBindgroup);
        this.cache.set(hash, {
            wrapperClasses: new Map<string, GPURawBindgroup>([[wrapperClass.getNanoID(), wrapperClass]]),
            tracker
        })

        return tracker;
    }


    createGPUBindgroup(label: string | undefined, layout: GPURawBindgroupLayout, entries: ReturnType<typeof this.getBindgroupEntries>["entries"]) {
        const device = DeviceManager.instance.device;

        return device.createBindGroup({
            label,
            layout: layout.getTracker().getGPUResource(),
            entries
        })
    }

    public createBindgroup(T: GPUBindGroupManagerCreateEntries) {

        const layout: GPURawBindgroupLayout = this.layoutManager.createLayout({
            resources: T.resources,
            layoutLabel: T.layoutLabel
        })

        const bindgroupResources = getResourcesWidthBinding(T.resources)

        const boundResources: Record<string, EntryResource> = {};
        const bindgroupEntries = this.getBindgroupEntries(bindgroupResources)

        const bindgroupHash = this.compileHash(layout, boundResources)

        const cachedData = this.cache.get(bindgroupHash);

        if (cachedData && cachedData.wrapperClasses.size > 0) {
            const clone = Array.from(cachedData.wrapperClasses)[0][1].clone(layout);
            cachedData.wrapperClasses.set(clone.getNanoID(), clone);

            this.setBindgroupRelations(clone, convertRecordToArray(boundResources), layout)
            return clone;
        }

        const gpuBindgroup = this.createGPUBindgroup(T.bindgroupLabel, layout, this.getBindgroupEntries(bindgroupResources).entries);

        const tracker = new BindgroupTracker(bindgroupHash, gpuBindgroup);

        const bindgroup = new GPURawBindgroup({
            label: T.bindgroupLabel,
            entries: bindgroupEntries.entries,
            boundResources: bindgroupEntries.boundResources,
            layout,
            tracker,
            isCopy: false
        })


        this.cache.set(bindgroupHash, {
            wrapperClasses: new Map([[bindgroup.getNanoID(), bindgroup]]),
            tracker
        });
        this.setBindgroupRelations(bindgroup, convertRecordToArray(boundResources), layout)
        return bindgroup;
    }

    private setBindgroupRelations(group: GPURawBindgroup, resources: EntryResource[], layout: GPURawBindgroupLayout) {
        group.addParent(layout)
        layout.addChild(group);
        resources.forEach((resource: EntryResource) => {
            resource.addChild(group);
            group.addParent(resource);
        })
    }

    getCachedInfoByHash(hash: string) {
        return this.cache.get(hash);
    }

    compileHash(layout: GPURawBindgroupLayout, resources: Record<string, EntryResource>) {
        const entries = convertRecordToArray(resources);
        entries.sort((a, b) => {
            return a.getNanoID().localeCompare(b.getNanoID());
        });
        const entriesHash = entries.map(i => i.getNanoID()).join("");

        return fnv1aHash(`${layout.getTracker().getHash()}${entriesHash}`)
    }

    addToCache(hash: string, data: {
        wrapperClasses: Map<string, GPURawBindgroup>,
        tracker: BindgroupTracker
    }) {
        this.cache.set(hash, data)
    }

    getBindgroupEntries(resources: Record<string, {
        resource: EntryResource
        visibility: number,
        binding: number
    }>) {
        let entriesHash = ``;
        const entries: GPUBindGroupEntry[] = []
        const boundResources: Record<string, EntryResource> = {}
        for (const key in resources) {
            const {resource, binding} = resources[key];
            entriesHash += resource.getNanoID();
            boundResources[key] = resource;

            if (resource instanceof GPURawBuffer) {
                entries.push({
                    resource: {
                        buffer: resource.getTracker().getGPUResource()
                    },
                    binding
                })
            } else if (resource instanceof GPURawTexture) {
                entries.push({
                    resource: resource.getTracker().getView({
                        dimension: resource.getViewDimension(),
                    }),
                    binding
                })
            } else {
                entries.push({
                    resource: resource.getTracker().getGPUResource(),
                    binding
                })
            }
        }

        return {
            entries,
            boundResources
        }
    }


    public static init() {
        if (!this._instance) {
            this._instance = new BindgroupManager();
        }

        return this._instance
    }
}