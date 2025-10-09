import type {
    EntryResource,
    GPUBindGroupManagerCreateEntries
} from "./bindgroup.types.ts";
import GPURawBuffer from "../buffer/GPURawBuffer.ts";
import {GPURawTexture} from "../texture/GPURawTexture.ts";
import {fnv1aHash} from "../../../helpers/globalHelpler.ts";
import {getLayoutEntries, hashBindgroupLayout} from "../../../helpers/bindgroupHelper.ts";
import GPURawBindgroupLayout from "./GPURawBindgroupLayout.ts";
import {IndestructiveTrackedResource} from "../../core/tracking/IndestructiveTrackedResources.ts";
import GPURawBindgroup from "./GPURawBindgroup.ts";
import type {DestructiveResource} from "../../core/tracking/destructiveTrackedResources.ts";


export default class GPUBindgroupManager {
    private static _instance: GPUBindgroupManager;
    private bindGroupCache: Map<string, {
        wrapperClasses: Map<string, GPURawBindgroup>,
        tracker: IndestructiveTrackedResource
    }> = new Map();
    private bindGroupLayoutCache: Map<string, {
        wrapperClasses: Map<string, GPURawBindgroupLayout>,
        tracker: IndestructiveTrackedResource
    }> = new Map();

    private constructor() {
    }

    layoutHashExists(hash: string) {
        return this.bindGroupLayoutCache.has(hash);
    }

    bindgroupHashExists(hash: string) {
        return this.bindGroupCache.has(hash);
    }

    createLayout(T: GPUBindGroupManagerCreateEntries) {

        const layoutEntries = getLayoutEntries(T.resources)
        const hash = hashBindgroupLayout(layoutEntries);
        const cachedData = this.bindGroupLayoutCache.get(hash);

        if (cachedData && cachedData.wrapperClasses.size > 0) {
            const clone = Array.from(cachedData.wrapperClasses)[0][1].clone();
            cachedData.wrapperClasses.set(clone.getNanoID(), clone);
            return clone;
        }
        const tracker = new IndestructiveTrackedResource(hash);

        const layout = new GPURawBindgroupLayout({
            isCopy: false,
            entries: getLayoutEntries(T.resources),
            label: T.layoutLabel,
            tracker
        });

        this.bindGroupLayoutCache.set(hash, {
            wrapperClasses: new Map([[layout.getNanoID(), layout]]),
            tracker
        });
        return layout;
    }

    removeLayout(hash: string, nanoId: string) {
        this.removeFromCache(hash, nanoId, "bindGroupLayoutCache")
    }

    removeBindgroup(hash: string, nanoId: string) {
        this.removeFromCache(hash, nanoId, "bindGroupCache")
    }

    private removeFromCache(hash: string, nanoId: string, cacheName: "bindGroupLayoutCache" | "bindGroupCache") {
        const map = this[cacheName].get(hash);
        if (map) {
            map.wrapperClasses.delete(nanoId)
            if (map.wrapperClasses.size <= 0) this[cacheName].delete(hash)
        }
    }

    public createBindgroup(T: GPUBindGroupManagerCreateEntries) {

        const layout: GPURawBindgroupLayout = this.createLayout(T);

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

        const tracker = new IndestructiveTrackedResource(bindgroupHash);


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
            this._instance = new GPUBindgroupManager();
        }

        return this._instance
    }
}