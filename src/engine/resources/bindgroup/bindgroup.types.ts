import type GPUUniformBuffer from "../buffer/GPUUniformBuffer.ts";
import type GPUStorageBuffer from "../buffer/GPUStorageBuffer.ts";
import type GPUBaseTextureArray from "../texture/GPUBaseTextureArray.ts";
import type GPUBaseTexture from "../texture/GPUBaseTexture.ts";
import type GPURawBindgroupLayout from "../bindgroupLayout/GPURawBindgroupLayout.ts";
import type GPURawSampler from "../sampler/GPURawSampler.ts";
import type {BindgroupLayoutTracker} from "../../core/tracking/bindgroupLayoutTracker/bindgroupLayoutTracker.ts";
import {BindgroupTracker} from "../../core/tracking/bindgroupTracker/bindgroupTracker.ts";

export type EntryResource = GPUUniformBuffer | GPUStorageBuffer | GPUBaseTextureArray | GPUBaseTexture | GPURawSampler

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
    tracker: BindgroupTracker
} | {
    isCopy: true;
    layout: GPURawBindgroupLayout;
    entries: GPUBindGroupEntry[];
    totalBindingNumber: number;
    label?: string;
    boundResources: Record<string, EntryResource>;
    tracker: BindgroupTracker
}

export type GPURawBindgroupLayoutDescriptor = {
    label?: string;
    isCopy: false,
    tracker: BindgroupLayoutTracker,
    entries: GPUBaseBindgroupLayoutEntries["entries"]
} | {
    isCopy: true;
    tracker: BindgroupLayoutTracker,
    entries: GPUBindGroupLayoutEntry[]
    totalBindingNumber: number;
    bindgroupLayoutLabel?: string;
    entriesWithName: GPUBaseBindgroupLayoutEntries["entries"];
}