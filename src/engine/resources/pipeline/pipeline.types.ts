import type GPURawBindgroupLayout from "../bindgroupLayout/GPURawBindgroupLayout.ts";
import type GPURawPipelineLayout from "../pipelineLayout/GPURawPipelineLayout.ts";
import type GPURawShaderModule from "../shaderModule/GPURawShaderModule.ts";
import type GPUVertexBuffer from "../buffer/GPUVertexBuffer.ts";
import type {PipelineTracker} from "../../core/tracking/pipelineTracker/pipelineTracker.ts";

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

export type RenderPipelineParent = GPURawPipelineLayout | GPURawShaderModule;

export type PipelineGraph = {
    parents: Set<RenderPipelineParent>,
    children: null
}


export type GPURawPipelineEntries = {
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
    tracker: PipelineTracker
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