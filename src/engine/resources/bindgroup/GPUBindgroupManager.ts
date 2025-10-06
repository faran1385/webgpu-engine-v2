import GPUBaseBindgroup from "./GPUBaseBindgroup.ts";
import GPUBaseBindgroupLayout from "./GPUBaseBindgroupLayout.ts";
import type {
    EntryResource,
    GPUBaseBindgroupLayoutEntries,
    GPUBindGroupManagerCreateEntries
} from "./bindgroup.types.ts";
import GPURawBuffer from "../buffer/GPURawBuffer.ts";
import {GPURawTexture} from "../texture/GPURawTexture.ts";
import {fnv1aHash} from "../../../helpers/globalHelpler.ts";


export default class GPUBindgroupManager {
    private static _instance: GPUBindgroupManager;
    private bindGroupCache: Map<string, GPUBaseBindgroup> = new Map();
    private bindGroupLayoutCache: Map<string, GPUBaseBindgroupLayout> = new Map();

    private constructor() {}

    public create(device: GPUDevice, T: GPUBindGroupManagerCreateEntries) {
        const layoutEntries = this.getLayoutEntries(T.resources)
        const layoutHash = this.hashBindgroupLayout(layoutEntries);
        let layout: GPUBaseBindgroupLayout;

        if (this.bindGroupLayoutCache.has(layoutHash)) {
            layout = this.bindGroupLayoutCache.get(layoutHash)!;
        } else {
            layout = new GPUBaseBindgroupLayout(device, {
                label: T.layoutLabel,
                entries: layoutEntries,
                hash: layoutHash
            })
            this.bindGroupLayoutCache.set(layoutHash, layout);
        }

        const bindgroupEntries = this.getBindgroupEntries(layout, T.resources)
        const bindgroupHash = fnv1aHash(`${layoutHash}${bindgroupEntries.entriesHash}`)
        let bindgroup: GPUBaseBindgroup;

        if (this.bindGroupCache.has(bindgroupHash)) {
            bindgroup = this.bindGroupCache.get(bindgroupHash)!;
        } else {
            bindgroup = new GPUBaseBindgroup(device, {
                label: T.bindgroupLabel,
                entries: bindgroupEntries.entries,
                hash: bindgroupHash,
                boundResources: bindgroupEntries.boundResources,
                layout
            })
            this.bindGroupCache.set(bindgroupHash, bindgroup);
        }

        return bindgroup;
    }

    private getBindgroupEntries(layout: GPUBaseBindgroupLayout, resources: GPUBindGroupManagerCreateEntries["resources"]) {
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

    private hashBindgroupLayout = (entries: GPUBaseBindgroupLayoutEntries["entries"]) => {
        let hash = "";
        for (const key in entries) {
            const entry = entries[key];

            if ("texture" in entry) {
                hash += `${entry.binding}${entry.visibility}${entry.texture?.sampleType}${entry.texture?.multisampled}${entry.texture?.viewDimension}`
            } else if ("buffer" in entry) {
                hash += `${entry.binding}${entry.visibility}${entry.buffer?.type}`
            } else {
                hash += `${entry.binding}${entry.visibility}${entry.sampler?.type}`
            }
        }
        return hash
    }

    private getLayoutEntries(resources: GPUBindGroupManagerCreateEntries["resources"]) {
        const entries: Record<string, GPUBindGroupLayoutEntry> = {}

        let i = 0;
        for (const key in resources) {
            const {resource, visibility} = resources[key];

            if (resource instanceof GPURawBuffer) {
                entries[key] = {
                    buffer: {
                        type: resource.bindType
                    },
                    visibility,
                    binding: i
                }
            } else if (resource instanceof GPURawTexture) {
                entries[key] = {
                    texture: {
                        sampleType: resource.getSampleType(),
                        viewDimension: resource.getViewDimension(),
                        multisampled: resource.getSampleCount() > 1
                    },
                    visibility,
                    binding: i
                }
            } else {
                entries[key] = {
                    sampler: {
                        type: resource.samplerType
                    },
                    visibility,
                    binding: i
                }
            }
            i++
        }

        return entries
    }

    public static init() {
        if (!this._instance) {
            this._instance = new GPUBindgroupManager();
        }

        return this._instance
    }
}