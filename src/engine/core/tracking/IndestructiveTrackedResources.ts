import TrackedResource from "./TrackedResource.ts";
import type BindgroupManager from "../../resources/bindgroup/BindgroupManager.ts";
import type BindgroupLayoutManager from "../../resources/bindgroupLayout/BindgroupLayoutManager.ts";
import type PipelineLayoutManager from "../../resources/pipelineLayout/PipelineLayoutManager.ts";
import type RenderPipelineManager from "../../resources/pipeline/RenderPipelineManager.ts";
import type SamplerManager from "../../resources/sampler/SamplerManager.ts";
import type ShaderModuleManager from "../../resources/shaderModule/ShaderModuleManager.ts";

export type Manager =
    BindgroupManager
    | BindgroupLayoutManager
    | PipelineLayoutManager
    | RenderPipelineManager
    | SamplerManager
    | ShaderModuleManager

export class IndestructiveTrackedResource extends TrackedResource {
    private hash: string;

    constructor(hash: string) {
        super();
        this.hash = hash;
    }

    getHash() {
        return this.hash;
    }
}
