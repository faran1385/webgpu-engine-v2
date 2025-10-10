import type {
    EntryResource,
    GPUBindGroupManagerCreateEntries
} from "./bindgroup.types.ts";
import GPURawBuffer from "../buffer/GPURawBuffer.ts";
import {GPURawTexture} from "../texture/GPURawTexture.ts";
import {fnv1aHash} from "../../../helpers/globalHelpler.ts";
import GPURawBindgroupLayout from "../bindgroupLayout/GPURawBindgroupLayout.ts";
import GPURawBindgroup from "./GPURawBindgroup.ts";
import type {DestructiveResource} from "../../core/tracking/destructiveTrackedResources.ts";
import BindgroupLayoutManager from "../bindgroupLayout/BindgroupLayoutManager.ts";
import {BindgroupTracker} from "../../core/tracking/bindgroupTracker/bindgroupTracker.ts";
import DeviceManager from "../../core/DeviceManager.ts";


export default class BindgroupManager {
    private static _instance: BindgroupManager;
    private bindGroupCache: Map<string, {
        wrapperClasses: Map<string, GPURawBindgroup>,
        tracker: BindgroupTracker
    }> = new Map();
    private layoutManager: BindgroupLayoutManager

    private constructor() {
        this.layoutManager = BindgroupLayoutManager.init();
    }


    hashExists(hash: string) {
        return this.bindGroupCache.has(hash);
    }


    removeBindgroup(hash: string, nanoId: string) {
        const map = this.bindGroupCache.get(hash);
        if (map) {
            map.wrapperClasses.delete(nanoId)
            if (map.wrapperClasses.size <= 0) this.bindGroupCache.delete(hash)
        }
    }


    createGPUBindgroup(label: string | undefined, layout: GPURawBindgroupLayout, entries: ReturnType<typeof this.getBindgroupEntries>["entries"]) {
        const device = DeviceManager.instance.device;

        return device.createBindGroup({
            label,
            layout: layout.getTracker().getLayout(),
            entries
        })
    }

    public createBindgroup(T: GPUBindGroupManagerCreateEntries) {

        const layout: GPURawBindgroupLayout = this.layoutManager.createLayout({
            resources: T.resources,
            layoutLabel: T.layoutLabel
        })

        const bindgroupEntries = this.getBindgroupEntries(layout, T.resources)
        const bindgroupHash = fnv1aHash(`${layout.getTracker().getHash()}${bindgroupEntries.entriesHash}`)

        const cachedData = this.bindGroupCache.get(bindgroupHash);

        const resources: DestructiveResource[] = []

        for (const entry in T.resources) {
            if (T.resources[entry].resource instanceof GPURawBuffer || T.resources[entry].resource instanceof GPURawTexture) {
                resources.push(T.resources[entry].resource)
            }
        }

        if (cachedData && cachedData.wrapperClasses.size > 0) {
            const clone = Array.from(cachedData.wrapperClasses)[0][1].clone();
            cachedData.wrapperClasses.set(clone.getNanoID(), clone);

            this.setBindgroupRelations(clone, resources, layout)
            return clone;
        }

        const gpuBindgroup = this.createGPUBindgroup(T.bindgroupLabel, layout, this.getBindgroupEntries(layout, T.resources).entries);

        const tracker = new BindgroupTracker(bindgroupHash, gpuBindgroup);


        const bindgroup = new GPURawBindgroup({
            label: T.bindgroupLabel,
            entries: bindgroupEntries.entries,
            boundResources: bindgroupEntries.boundResources,
            layout,
            tracker,
            isCopy: false
        })


        this.bindGroupCache.set(bindgroupHash, {
            wrapperClasses: new Map([[bindgroup.getNanoID(), bindgroup]]),
            tracker
        });
        this.setBindgroupRelations(bindgroup, resources, layout)
        return bindgroup;
    }

    private setBindgroupRelations(group: GPURawBindgroup, resources: DestructiveResource[], layout: GPURawBindgroupLayout) {
        group.getLayout().getTracker().addDependency(group.getTracker());
        group.getTracker().addDependent(layout.getTracker())
        resources.forEach(resource => {
            resource.getTracker().addDependency(group.getTracker());
            group.getTracker().addDependent(resource.getTracker())
        })
    }

    private getBindgroupEntries(layout: GPURawBindgroupLayout, resources: GPUBindGroupManagerCreateEntries["resources"]) {
        let entriesHash = ``;
        const entries: GPUBindGroupEntry[] = []
        const boundResources: Record<string, EntryResource> = {}
        for (const key in resources) {
            const {binding} = layout.getEntry(key)!
            const {resource} = resources[key];
            entriesHash += resource.getNanoID();
            boundResources[key] = resource;

            if (resource instanceof GPURawBuffer) {
                entries.push({
                    resource: {
                        buffer: resource.getGPUBuffer()
                    },
                    binding
                })
            } else if (resource instanceof GPURawTexture) {
                entries.push({
                    resource: resource.getTexture().createView({
                        dimension: resource.getViewDimension(),
                    }),
                    binding
                })
            } else {
                entries.push({
                    resource: resource.getSampler(),
                    binding
                })
            }
        }

        return {
            entries,
            entriesHash,
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