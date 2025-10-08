import type GPURawBindgroupLayout from "../bindgroup/GPURawBindgroupLayout.ts";
import type GPURawPipelineLayout from "./GPURawPipelineLayout.ts";
import type GPURawShaderModule from "../shaderModule/GPURawShaderModule.ts";
import type GPUVertexBuffer from "../buffer/GPUVertexBuffer.ts";
import type {TrackedResource} from "../../core/tracking/TrackedResources.ts";

export enum Blending {
    NoBlending = 0b00000000,
    Alpha = 0b00000001,
    Additive = 0b00000010,
    PreMultipliedAlpha = 0b00000100,
    Multiply = 0b00001000,
    Screen = 0b00010000,
    Darken = 0b00100000,
    Lighten = 0b01000000,
    Subtract = 0b10000000,
}


export type GPURawPipelineEntries = {
    isCopy: false,
    pipelineLabel?: string;
    vertex: {
        module: GPURawShaderModule
        entryPoint?: string
        constants?: Record<string, GPUPipelineConstantValue>,
        buffers: (GPUVertexBuffer)[]
    },
    fragment?: {
        module: GPURawShaderModule
        entryPoint?: string
        constants?: Record<string, GPUPipelineConstantValue>,
        targets: ({
            blend?: Blending,
            mask?: number,
            format: GPUTextureFormat
        } | null | undefined)[]
    },
    multiSample?: GPUMultisampleState
    layout: GPURawPipelineLayout,
    depthStencil?: GPUDepthStencilState,
    primitive?: GPUPrimitiveState,
    tracker: TrackedResource
} | {
    isCopy: true,
    tracker: TrackedResource
    pipelineLabel?: string;
    vertex: {
        module: GPURawShaderModule
        entryPoint?: string
        constants?: Record<string, GPUPipelineConstantValue>,
        buffers: (GPUVertexBuffer)[]
    },
    fragment?: {
        module: GPURawShaderModule
        entryPoint?: string
        constants?: Record<string, GPUPipelineConstantValue>,
        targets: ({
            blend?: Blending,
            mask?: number,
            format: GPUTextureFormat
        } | null | undefined)[]
    },
    layout: GPURawPipelineLayout
    primitive?: GPUPrimitiveState
    multiSample?: GPUMultisampleState
    depthStencil?: GPUDepthStencilState
    gpuPipeline: GPURenderPipeline
}


export type GPURawPipelineLayoutEntries = {
    label?: string
    bindgroupLayouts: GPURawBindgroupLayout[],
    isCopy: false
    tracker: TrackedResource
} | {
    isCopy: true
    bindgroupLayouts: GPURawBindgroupLayout[]
    pipelineLayout: GPUPipelineLayout;
    label?: string,
    tracker: TrackedResource
}

export type ManagerCreateEntries = {
    layoutLabel?: string,
    bindgroupLayouts: GPURawBindgroupLayout[],
    pipelineLabel?: string,
    vertex: {
        module: GPURawShaderModule
        entryPoint?: string
        constants?: Record<string, GPUPipelineConstantValue>,
        buffers: (GPUVertexBuffer)[]
    },
    fragment?: {
        module: GPURawShaderModule
        entryPoint?: string
        constants?: Record<string, GPUPipelineConstantValue>,
        targets: ({
            blend?: Blending,
            mask?: number,
            format: GPUTextureFormat
        } | null | undefined)[]
    },
    depthStencil?: GPUDepthStencilState,
    primitive?: GPUPrimitiveState,
    multiSample?: GPUMultisampleState
}