import type {GPUBaseBindgroupLayoutEntries, GPUBindGroupManagerCreateEntries} from "../bindgroup/bindgroup.types.ts";
import type GPURawBindgroup from "../bindgroup/GPURawBindgroup.ts";
import type GPURawPipelineLayout from "../pipelineLayout/GPURawPipelineLayout.ts"

    ;
import type {BindgroupLayoutTracker} from "../../core/tracking/bindgroupLayoutTracker/bindgroupLayoutTracker.ts";

export type BindgroupLayoutChild = GPURawBindgroup | GPURawPipelineLayout

export type LayoutManagerCreateEntries = {
    resources: GPUBindGroupManagerCreateEntries["resources"],
    layoutLabel?: string,
}

export type BindgroupLayoutGraph = {
    parents: null,
    children: Set<BindgroupLayoutChild>
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