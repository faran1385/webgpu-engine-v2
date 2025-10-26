import type {IndestructiveTrackedResource} from "../core/tracking/IndestructiveTrackedResources.ts";
import type GPURawBindgroup from "./bindgroup/GPURawBindgroup.ts";
import type GPURawBindgroupLayout from "./bindgroupLayout/GPURawBindgroupLayout.ts";
import type GPURawBuffer from "./buffer/GPURawBuffer.ts";
import type GPURawRenderPipeline from "./pipeline/GPURawRenderPipeline.ts";
import type GPURawPipelineLayout from "./pipelineLayout/GPURawPipelineLayout.ts";
import type GPURawSampler from "./sampler/GPURawSampler.ts";
import type {GPURawTexture} from "./texture/GPURawTexture.ts";
import type GPURawShaderModule from "./shaderModule/GPURawShaderModule.ts";


export abstract class BaseIndestructiveResourceNeeds {
    abstract clone(...args: any[]): void;

    abstract needsUpdate: boolean;
    abstract isBuilt: boolean;

    abstract destroyInternal(): void;

    abstract getNanoID(): string;

    protected abstract nanoID: string;
    protected abstract tracker: IndestructiveTrackedResource;

    abstract getTracker(): IndestructiveTrackedResource;

    abstract rebuild(): void;
}

export abstract class BaseDestructiveResourceNeeds {

    abstract needsUpdate: boolean;
    abstract isBuilt: boolean;

    abstract getNanoID(): string;

    protected abstract nanoID: string;

    abstract destroy(): void;

    abstract rebuild(): void;
}


export type WrapperClass =
    GPURawBindgroup
    | GPURawBindgroupLayout
    | GPURawBuffer
    | GPURawRenderPipeline
    | GPURawPipelineLayout
    | GPURawSampler
    | GPURawTexture
    | GPURawShaderModule

export type IndestructiveWrapperClass =
    GPURawBindgroup
    | GPURawBindgroupLayout
    | GPURawRenderPipeline
    | GPURawPipelineLayout
    | GPURawSampler
    | GPURawShaderModule