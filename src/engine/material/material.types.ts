import type {EntryResource} from "../resources/bindgroup/bindgroup.types.ts";
import {Blending, type GPURawPipelineEntries} from "../resources/pipeline/pipeline.types.ts";

export type MaterialEntries = {
    vertex: {
        module: GPURawPipelineEntries["vertex"]["module"]
        entryPoint?: GPURawPipelineEntries["vertex"]["entryPoint"]
        constants?: GPURawPipelineEntries["vertex"]["constants"]
    },
    fragment?: GPURawPipelineEntries["fragment"],
    multiSample?: GPURawPipelineEntries["multiSample"],
    depthStencil?: GPURawPipelineEntries["depthStencil"],
    pipelineLabel?: GPURawPipelineEntries["pipelineLabel"],
    primitive?: {
        frontFace?:GPUPrimitiveState["frontFace"],
        cullMode?:GPUPrimitiveState["cullMode"],
        unclippedDepth?:GPUPrimitiveState["unclippedDepth"],
    },
    resources: Record<string, {
        resource: EntryResource,
        visibility: number
    }>,
    hash: string
}

export type MaterialCreateEntries = {
    pipelineLayoutLabel?: string,
    vertex: {
        shader: string
        entryPoint?: GPURawPipelineEntries["vertex"]["entryPoint"]
        constants?: GPURawPipelineEntries["vertex"]["constants"]
    },
    fragment?: {
        shader: string
        entryPoint?: string
        constants?: Record<string, GPUPipelineConstantValue>
        targets: ({
            blend?: Blending
            mask?: number
            format: GPUTextureFormat
        } | null | undefined)[]
    },
    multiSample?: GPURawPipelineEntries["multiSample"],
    depthStencil?: GPURawPipelineEntries["depthStencil"],
    pipelineLabel?: GPURawPipelineEntries["pipelineLabel"],
    primitive?: {
        frontFace?:GPUPrimitiveState["frontFace"],
        cullMode?:GPUPrimitiveState["cullMode"],
        unclippedDepth?:GPUPrimitiveState["unclippedDepth"],
    },
    resources: Record<string, {
        resource: EntryResource,
        visibility: number
    }>,
}