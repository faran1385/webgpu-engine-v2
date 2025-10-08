import {getNanoId} from "../../../helpers/globalHelpler.ts";
import {Blending, type GPURawPipelineEntries} from "./pipeline.types.ts";
import type GPURawPipelineLayout from "./GPURawPipelineLayout.ts";
import DeviceManager from "../../core/DeviceManager.ts";
import type {TrackedResource} from "../../core/tracking/TrackedResources.ts";
import GPURenderPipelineManager from "./GPURenderPipelineManager.ts";
import BaseResourceNeeds from "../BaseResourceNeeds.ts";

export default class GPURawRenderPipeline extends BaseResourceNeeds{
    protected nanoID!: string;
    private label?: string;
    protected tracker: TrackedResource;
    vertexSetting: GPURawPipelineEntries["vertex"]

    fragmentSetting: GPURawPipelineEntries["fragment"];

    private layout: GPURawPipelineLayout

    primitive: GPURawPipelineEntries["primitive"]
    multiSample: GPURawPipelineEntries["multiSample"]

    depthStencil?: GPURawPipelineEntries["depthStencil"]
    private gpuPipeline!: GPURenderPipeline

    constructor(T: GPURawPipelineEntries) {
        super();
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
        this.tracker = T.tracker
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
        if (T.isCopy) {
            this.gpuPipeline = T.gpuPipeline;
        } else {
            this.createPipeline();
        }
    }

    getTracker() {
        return this.tracker;
    }

    clone() {
        return new GPURawRenderPipeline({
            vertex: this.vertexSetting,
            fragment: this.fragmentSetting,
            multiSample: this.multiSample,
            gpuPipeline: this.gpuPipeline,
            pipelineLabel: this.label,
            tracker: this.tracker,
            primitive: this.primitive,
            depthStencil: this.depthStencil,
            isCopy: true,
            layout: this.layout
        })
    }

    destroyInternal() {
        const manager = GPURenderPipelineManager.init();
        manager.removePipeline(this.tracker.getHash(), this.nanoID)

        this.tracker.getDependents().forEach(dependent => {
            dependent.removeDependency(this.tracker);
        });

        this.tracker.getDependencies().forEach(dependency => {
            dependency.removeDependent(this.tracker);
        });

        this.label =undefined;
        this.tracker =undefined as any;
        this.vertexSetting =undefined as any;
        this.fragmentSetting =undefined;
        this.primitive =undefined;
        this.multiSample =undefined;
        this.depthStencil =undefined;
        this.gpuPipeline =undefined as any;
        this.layout =undefined as any;
    }

    private createPipeline() {
        const device = DeviceManager.instance.device

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