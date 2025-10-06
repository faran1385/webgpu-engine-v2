import {getNanoId} from "../../helpers/globalHelpler.ts";
import type {MaterialEntries} from "./material.types.ts";
import type {GPURawPipelineEntries} from "../resources/pipeline/pipeline.types.ts";

export default class GPURawMaterial {
    private nanoID!: string;
    private hash: string;

    private vertex: {
        module: GPURawPipelineEntries["vertex"]["module"]
        entryPoint?: GPURawPipelineEntries["vertex"]["entryPoint"]
        constants?: GPURawPipelineEntries["vertex"]["constants"]
    }
    private fragment?: GPURawPipelineEntries["fragment"]
    private multiSample?: GPURawPipelineEntries["multiSample"]

    private depthStencil?: GPURawPipelineEntries["depthStencil"]
    private primitive: {
        frontFace?: GPUPrimitiveState["frontFace"]
        cullMode?: GPUPrimitiveState["cullMode"]
        unclippedDepth?: GPUPrimitiveState["unclippedDepth"]
    }

    private resources: MaterialEntries["resources"]


    constructor(T: MaterialEntries) {
        this.nanoID = getNanoId();
        this.resources = T.resources;
        this.hash = T.hash;
        this.vertex = {
            module: T.vertex.module,
            entryPoint: T.vertex.entryPoint,
            constants: T.vertex.constants ?? {},
        }

        this.fragment = T.fragment ? {
            entryPoint: T.fragment.entryPoint,
            module: T.fragment.module,
            targets: T.fragment.targets,
            constants: T.fragment.constants ?? {},
        } : undefined


        this.primitive = {
            cullMode: T.primitive?.cullMode ?? "none",
            frontFace: T.primitive?.frontFace ?? "ccw",
            unclippedDepth: T.primitive?.unclippedDepth ?? false,
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
    }

    getResources() {
        return this.resources;
    }

    getHash() {
        return this.hash
    }


    getPrimitive() {
        return this.primitive;
    }

    getDepthStencil() {
        return this.depthStencil;
    }


    getMultiSample() {
        return this.multiSample
    }

    getVertex() {
        return this.vertex;
    }

    getFragment() {
        return this.fragment;
    }

    getNanoID(): string {
        return this.nanoID;
    }
}