import type {
    GPUBaseBindgroupLayoutEntries,
    GPUBindGroupManagerCreateEntries
} from "../engine/resources/bindgroup/bindgroup.types.ts";
import {fnv1aHash} from "./globalHelpler.ts";
import GPURawBuffer from "../engine/resources/buffer/GPURawBuffer.ts";
import {GPURawTexture} from "../engine/resources/texture/GPURawTexture.ts";

export function hashBindgroupLayout(entries: GPUBaseBindgroupLayoutEntries["entries"]) {
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
    return fnv1aHash(hash)
}

export function getLayoutEntries(resources: GPUBindGroupManagerCreateEntries["resources"]) {
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