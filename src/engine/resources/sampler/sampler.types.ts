import type {SamplerTracker} from "../../core/tracking/sampler/SamplerTracker.ts";
import type GPURawBindgroup from "../bindgroup/GPURawBindgroup.ts";

export type GPURawSamplerEntries = GPUSamplerDescriptor & {
    label?: string,
    tracker: SamplerTracker
}
export type SamplerChild = GPURawBindgroup;

export type SamplerGraph = {
    parents: null,
    children: Set<SamplerChild>
}