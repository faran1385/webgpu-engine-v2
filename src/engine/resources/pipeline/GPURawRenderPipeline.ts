import {getNanoId} from "../../../helpers/globalHelpler.ts";
import {Blending, type GPURawPipelineEntries} from "./pipeline.types.ts";
import type GPURawPipelineLayout from "./GPURawPipelineLayout.ts";
import {getPipelineHash} from "../../../helpers/pipelineHelper.ts";
import type GPURenderPipelineManager from "./GPURenderPipelineManager.ts";

export default class GPURawRenderPipeline {
    private nanoID!: string;
    private hash: string;
    private label?: string;

    vertexSetting: GPURawPipelineEntries["vertex"]

    fragmentSetting: GPURawPipelineEntries["fragment"];

    private layout: GPURawPipelineLayout

    primitive: GPURawPipelineEntries["primitive"]
    multiSample: GPURawPipelineEntries["multiSample"]

    depthStencil?: GPURawPipelineEntries["depthStencil"]
    private gpuPipeline!: GPURenderPipeline

    constructor(device: GPUDevice, T: GPURawPipelineEntries) {
        this.layout = T.layout;
        this.nanoID = getNanoId();
        this.vertexSetting = {
            module: T.vertex.module,
            entryPoint: T.vertex.entryPoint,
            constants: T.vertex.constants ?? {},
            buffers: T.vertex.buffers
        }
        this.label = T.pipelineLabel;

        this.fragmentSetting = T.fragment ? {
            entryPoint: T.fragment.entryPoint,
            module: T.fragment.module,
            targets: T.fragment.targets,
            constants: T.fragment.constants ?? {},
        } : undefined
        this.hash = T.hash
        this.primitive = {
            cullMode: T.primitive?.cullMode ?? "none",
            stripIndexFormat: T.primitive?.stripIndexFormat,
            frontFace: T.primitive?.frontFace ?? "ccw",
            unclippedDepth: T.primitive?.unclippedDepth ?? false,
            topology: T.primitive?.topology ?? "triangle-list"
        }
        this.multiSample = {
            count: T.multiSample?.count ?? 1,
            mask: T.multiSample?.mask ?? 0xFFFFFFFF,
            alphaToCoverageEnabled: T.multiSample?.alphaToCoverageEnabled ?? false,
        };
        this.depthStencil = T.depthStencil ? {
            format: T.depthStencil.format,

            depthWriteEnabled: T.depthStencil.depthWriteEnabled ?? false,
            depthCompare: T.depthStencil.depthCompare ?? 'always',
            depthBias: T.depthStencil.depthBias ?? 0,
            depthBiasSlopeScale: T.depthStencil.depthBiasSlopeScale ?? 0,
            depthBiasClamp: T.depthStencil.depthBiasClamp ?? 0,

            stencilReadMask: T.depthStencil.stencilReadMask ?? 0xFFFFFFFF,
            stencilWriteMask: T.depthStencil.stencilWriteMask ?? 0xFFFFFFFF,

            stencilBack: T.depthStencil.stencilBack ? {
                compare: T.depthStencil.stencilBack.compare ?? 'always',
                failOp: T.depthStencil.stencilBack.failOp ?? 'keep',
                depthFailOp: T.depthStencil.stencilBack.depthFailOp ?? 'keep',
                passOp: T.depthStencil.stencilBack.passOp ?? 'keep',
            } : {
                compare: 'always',
                failOp: 'keep',
                depthFailOp: 'keep',
                passOp: 'keep',
            },

            stencilFront: T.depthStencil.stencilFront ? {
                compare: T.depthStencil.stencilFront.compare ?? 'always',
                failOp: T.depthStencil.stencilFront.failOp ?? 'keep',
                depthFailOp: T.depthStencil.stencilFront.depthFailOp ?? 'keep',
                passOp: T.depthStencil.stencilFront.passOp ?? 'keep',
            } : {
                compare: 'always',
                failOp: 'keep',
                depthFailOp: 'keep',
                passOp: 'keep',
            },
        } : undefined;

        this.createPipeline(device);
    }

    rebuild(device: GPUDevice, pipelineManager: GPURenderPipelineManager) {
        const newHash = getPipelineHash({
            primitive: this.primitive,
            depthStencil: this.depthStencil,
            vertex: this.vertexSetting,
            fragment: this.fragmentSetting,
            multiSample: this.multiSample,
        }, this.layout.getHash())

        if (this.hash !== newHash) {
            this.createPipeline(device)
            pipelineManager.removePipeline(this.hash);
            this.hash = newHash;
        }
    }


    private createPipeline(device: GPUDevice) {
        const vertex: GPUVertexState = {
            module: this.vertexSetting.module.getModule(),
            entryPoint: this.vertexSetting.entryPoint,
            buffers: this.vertexSetting.buffers.map((buffer) => buffer.getLayout()),
            constants: this.vertexSetting.constants,
        }


        this.gpuPipeline = device.createRenderPipeline({
            primitive: this.primitive,
            depthStencil: this.depthStencil,
            label: this.label,
            layout: typeof this.layout === 'string' ? this.layout : this.layout.getPipelineLayout(),
            vertex,
            fragment: this.fragmentSetting ? {
                module: this.fragmentSetting.module.getModule(),
                entryPoint: this.fragmentSetting.entryPoint,
                targets: this.fragmentSetting.targets.map((i): (GPUColorTargetState | null | undefined) => {
                    if (i) {
                        return {
                            blend: this.getBlendState(i?.blend ?? Blending.NoBlending),
                            writeMask: i.mask ?? GPUColorWrite.ALL,
                            format: i.format
                        }
                    }

                    return i
                }),
                constants: this.vertexSetting.constants,
            } : undefined,
            multisample: this.multiSample
        })
    }

    getMultiSample() {
        return this.multiSample
    }

    getGPUPipeline() {
        return this.gpuPipeline
    }

    getLayout() {
        return this.layout
    }

    getHash(): string {
        return this.hash
    }

    getFragmentSetting() {
        return this.fragmentSetting
    }

    getVertexSetting() {
        return this.vertexSetting
    }

    getPrimitiveSetting() {
        return this.primitive
    }

    getDepthStencilSetting() {
        return this.depthStencil;
    }

    getBlendState(mode: Blending): GPUBlendState | undefined {
        switch (mode) {
            case Blending.NoBlending:
                return undefined;

            case Blending.Alpha:
                return {
                    color: {srcFactor: "src-alpha", dstFactor: "one-minus-src-alpha", operation: "add"},
                    alpha: {srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add"},
                };

            case Blending.Additive:
                return {
                    color: {srcFactor: "src-alpha", dstFactor: "one", operation: "add"},
                    alpha: {srcFactor: "one", dstFactor: "one", operation: "add"},
                };

            case Blending.PreMultipliedAlpha:
                return {
                    color: {srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add"},
                    alpha: {srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add"},
                };

            case Blending.Multiply:
                return {
                    color: {srcFactor: "dst", dstFactor: "zero", operation: "add"},
                    alpha: {srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add"},
                };

            case Blending.Screen:
                return {
                    color: {srcFactor: "one-minus-dst", dstFactor: "one", operation: "add"},
                    alpha: {srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add"},
                };

            case Blending.Darken:
                return {
                    color: {srcFactor: "one", dstFactor: "one", operation: "min"},
                    alpha: {srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add"},
                };

            case Blending.Lighten:
                return {
                    color: {srcFactor: "one", dstFactor: "one", operation: "max"},
                    alpha: {srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add"},
                };

            case Blending.Subtract:
                return {
                    color: {srcFactor: "one", dstFactor: "one", operation: "reverse-subtract"},
                    alpha: {srcFactor: "one", dstFactor: "one", operation: "add"},
                };

            default:
                return undefined;
        }
    }


    getNanoID(): string {
        return this.nanoID;
    }
}