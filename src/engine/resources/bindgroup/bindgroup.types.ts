import type GPUUniformBuffer from "../buffer/GPUUniformBuffer.ts";
import type GPUStorageBuffer from "../buffer/GPUStorageBuffer.ts";
import type GPUBaseTextureArray from "../texture/GPUBaseTextureArray.ts";
import type GPUBaseTexture from "../texture/GPUBaseTexture.ts";
import type GPURawBindgroupLayout from "./GPURawBindgroupLayout.ts";
import type GPURawSampler from "../sampler/GPURawSampler.ts";
import type {IndestructiveTrackedResource} from "../../core/tracking/IndestructiveTrackedResources.ts";

export type EntryResource = GPUUniformBuffer | GPUStorageBuffer | GPUBaseTextureArray | GPUBaseTexture | GPURawSampler
export type GPUBaseBindgroupEntries = {
    entries: GPUBindGroupEntry[],
    label?: string,
    layout: GPURawBindgroupLayout,
    hash: string
    boundResources: Record<string, EntryResource>;
}

export type GPUBaseBindgroupLayoutEntries = {
    entries: Record<string, GPUBindGroupLayoutEntry>,
    label?: string,
    hash: string
}

export type GPUBindGroupManagerCreateEntries = {
    resources: Record<string, {
        resource: EntryResource,
        visibility: number
    }>,
    bindgroupLabel?: string,
    layoutLabel?: string,
}

export type GPURawBindgroupDescriptor = {
    isCopy: false,
    entries: Iterable<GPUBindGroupEntry>,
    layout: GPURawBindgroupLayout,
    label?: string,
    boundResources: Record<string, EntryResource>,
    tracker: IndestructiveTrackedResource
} | {
    isCopy: true;
    layout: GPURawBindgroupLayout;
    entries: GPUBindGroupEntry[];
    totalBindingNumber: number;
    label?: string;
    bindgroup: GPUBindGroup;
    boundResources: Record<string, EntryResource>;
    tracker: IndestructiveTrackedResource
}

export type GPURawBindgroupLayoutDescriptor = {
    label?: string;
    isCopy: false,
    tracker: IndestructiveTrackedResource,
    entries: GPUBaseBindgroupLayoutEntries["entries"]
} | {
    isCopy: true;
    tracker: IndestructiveTrackedResource,
    layout: GPUBindGroupLayout;
    entries: GPUBindGroupLayoutEntry[]
    totalBindingNumber: number;
    bindgroupLayoutLabel?: string;
    entriesWithName: GPUBaseBindgroupLayoutEntries["entries"];
}