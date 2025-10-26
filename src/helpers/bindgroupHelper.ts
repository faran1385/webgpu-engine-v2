import type {
    EntryResource,
    GPUBaseBindgroupLayoutEntries,
    GPUBindGroupManagerCreateEntries
} from "../engine/resources/bindgroup/bindgroup.types.ts";
import {convertRecordKeysToArray, fnv1aHash} from "./globalHelpler.ts";
import GPURawBuffer from "../engine/resources/buffer/GPURawBuffer.ts";
import {GPURawTexture} from "../engine/resources/texture/GPURawTexture.ts";


export function hashBindgroupLayout(entries: GPUBaseBindgroupLayoutEntries["entries"]) {
    const entriesKeysAsArray = convertRecordKeysToArray(entries);

    entriesKeysAsArray.sort((a, b) => {
        return a.localeCompare(b);
    });

    let hash = "";

    entriesKeysAsArray.forEach((key) => {
        const entry = entries[key];

        if ("texture" in entry) {
            hash += `${entry.binding}${entry.visibility}${entry.texture?.sampleType}${entry.texture?.multisampled}${entry.texture?.viewDimension}`
        } else if ("buffer" in entry) {
            hash += `${entry.binding}${entry.visibility}${entry.buffer?.type}`
        } else {
            hash += `${entry.binding}${entry.visibility}${entry.sampler?.type}`
        }
    })

    return fnv1aHash(hash)
}

function getSortedResourcesKeys(resources: GPUBindGroupManagerCreateEntries["resources"]) {
    const converted = convertRecordKeysToArray(resources)
    converted.sort((a, b) =>
        a.localeCompare(b, undefined, {sensitivity: "base"})
    );

    return converted
}

export function getResourcesWidthBinding(resources: GPUBindGroupManagerCreateEntries["resources"]) {
    const sortedKeys = getSortedResourcesKeys(resources)

    const newSortedResources: Record<string, {
        resource: EntryResource
        visibility: number,
        binding: number,
    }> = {}

    sortedKeys.forEach((key, i) => {
        newSortedResources[key] = {
            ...resources[key],
            binding: i
        }
    })
    return newSortedResources
}

export function getLayoutEntries(resources: GPUBindGroupManagerCreateEntries["resources"]) {
    const entries: Record<string, GPUBindGroupLayoutEntry> = {}
    const sortedResources = getResourcesWidthBinding(resources);

    for (const key in resources) {
        const {resource, visibility, binding} = sortedResources[key];

        if (resource instanceof GPURawBuffer) {
            entries[key] = {
                buffer: {
                    type: resource.bindType
                },
                visibility,
                binding
            }
        } else if (resource instanceof GPURawTexture) {
            entries[key] = {
                texture: {
                    sampleType: resource.getSampleType(),
                    viewDimension: resource.getViewDimension(),
                    multisampled: resource.getSampleCount() > 1
                },
                visibility,
                binding
            }
        } else {
            entries[key] = {
                sampler: {
                    type: resource.samplerType
                },
                visibility,
                binding
            }
        }
    }

    return entries
}