import type GPURawRenderPipeline from "../pipeline/GPURawRenderPipeline.ts";
import type GPURawBindgroupLayout from "../bindgroupLayout/GPURawBindgroupLayout.ts";
import {PipelineLayoutTracker} from "../../core/tracking/pipelineLayoutTracker/pipelineLayoutTracker.ts";

export type PipelineLayoutChild = GPURawRenderPipeline;
export type PipelineLayoutParent = GPURawBindgroupLayout;

export type PipelineLayoutGraph = {
    parents: Set<PipelineLayoutParent>,
    children: Set<PipelineLayoutChild>
}

export type GPURawPipelineLayoutEntries = {
    label?: string
    bindgroupLayouts: GPURawBindgroupLayout[],
    tracker: PipelineLayoutTracker
}