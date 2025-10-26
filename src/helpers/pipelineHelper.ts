import {Blending, type ManagerCreateEntries} from "../engine/resources/pipeline/pipeline.types.ts";
import {fnv1aHash} from "./globalHelpler.ts";
import GPURawPipelineLayout from "../engine/resources/pipelineLayout/GPURawPipelineLayout.ts";

export function getPipelineHash(T: {
    fragment?: ManagerCreateEntries["fragment"],
    primitive?: ManagerCreateEntries["primitive"],
    depthStencil?: ManagerCreateEntries["depthStencil"],
    multiSample?: ManagerCreateEntries["multiSample"],
    vertex: ManagerCreateEntries["vertex"],
}, layoutHash: string) {
    // === Vertex Stage ===
    let vertexHash = [
        `vModule:${T.vertex.module.getNanoID()}`,
        `entryPoint:${T.vertex.entryPoint}`,
        `buffers:${T.vertex.buffers.map(i => i.getNanoID()).join(",")}`,
    ].join("|");


    const vertexConstants = Object.entries(T.vertex.constants ?? {})
        .map(([key, value]) => `${key}:${value}`)
        .join(",");
    vertexHash += `|constants:${vertexConstants}`;


    // === Fragment Stage ===
    let fragmentHash = "";
    if (T.fragment) {
        const fragModule = `fModule:${T.fragment.module.getNanoID()}`;
        const fragEntry = `entryPoint:${T.fragment.entryPoint}`;
        const fragConstants = Object.entries(T.fragment.constants ?? {})
            .map(([key, value]) => `${key}:${value}`)
            .join(",")


        const fragTargets = T.fragment.targets
            ?.map(i => {
                if (!i) return "null";
                return [
                    `format:${i.format}`,
                    `mask:${i.mask ?? GPUColorWrite.ALL}`,
                    `blend:${i.blend ?? Blending.NoBlending}`,
                ].join("|");
            })
            .join(",") ?? "";

        fragmentHash = [fragModule, fragEntry, `constants:${fragConstants}`, `targets:${fragTargets}`].join("|");
    }

    // === Primitive State ===
    const primitive = [
        `cullMode:${T.primitive?.cullMode ?? "none"}`,
        `stripIndexFormat:${T.primitive?.stripIndexFormat ?? "none"}`,
        `frontFace:${T.primitive?.frontFace ?? "ccw"}`,
        `unclippedDepth:${T.primitive?.unclippedDepth ?? false}`,
        `topology:${T.primitive?.topology ?? "triangle-list"}`,
    ].join("|");
    // === Depth-Stencil State ===
    let depthStencil = "";
    if (T.depthStencil) {
        const ds = T.depthStencil;
        depthStencil = [
            `format:${ds.format}`,
            `depthWrite:${ds.depthWriteEnabled ?? false}`,
            `depthCompare:${ds.depthCompare ?? "always"}`,
            `depthBias:${ds.depthBias ?? 0}`,
            `depthBiasSlope:${ds.depthBiasSlopeScale ?? 0}`,
            `depthBiasClamp:${ds.depthBiasClamp ?? 0}`,
            `stencilReadMask:${ds.stencilReadMask ?? 0xFFFFFFFF}`,
            `stencilWriteMask:${ds.stencilWriteMask ?? 0xFFFFFFFF}`,
            `stencilBack:${[
                ds.stencilBack?.compare ?? "always",
                ds.stencilBack?.failOp ?? "keep",
                ds.stencilBack?.depthFailOp ?? "keep",
                ds.stencilBack?.passOp ?? "keep",
            ].join(",")}`,
            `stencilFront:${[
                ds.stencilFront?.compare ?? "always",
                ds.stencilFront?.failOp ?? "keep",
                ds.stencilFront?.depthFailOp ?? "keep",
                ds.stencilFront?.passOp ?? "keep",
            ].join(",")}`,
        ].join("|");
    }
    // === Depth-Stencil State ===
    let multisample = [`count:${T.multiSample?.count ?? 1}`, `mask:${T.multiSample?.mask ?? 0xFFFFFFFF}`, `alphaToCoverageEnabled:${T.multiSample?.alphaToCoverageEnabled ?? false}`].join(",")


    // === Final Composite String ===
    const finalString = [
        `layout:${layoutHash}`,
        `vertex:${vertexHash}`,
        `fragment:${fragmentHash}`,
        `primitive:${primitive}`,
        `depthStencil:${depthStencil}`,
        `multiSample:${multisample}`,
    ].join("||");

    // Return as string (in hex for readability)
    return fnv1aHash(finalString);
}


export function getBlendState(mode: Blending): GPUBlendState | undefined {
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


export type pipelineDescriptor = {
    pipelineLabel?: ManagerCreateEntries["pipelineLabel"],
    vertex: ManagerCreateEntries["vertex"],
    fragment?: ManagerCreateEntries["fragment"],
    depthStencil?: GPUDepthStencilState,
    primitive?: GPUPrimitiveState,
    multiSample?: GPUMultisampleState
}

export function getPipelineDescriptor(T: pipelineDescriptor, layout: GPURawPipelineLayout): GPURenderPipelineDescriptor {
    const vertexSetting = {
        module: T.vertex.module.getTracker().getGPUResource(),
        entryPoint: T.vertex.entryPoint,
        buffers: T.vertex.buffers.map((buffer) => buffer.getLayout()),
        constants: T.vertex.constants,
    }
    const label = T.pipelineLabel;

    const fragmentSetting = T.fragment ? {
        entryPoint: T.fragment.entryPoint,
        module: T.fragment.module.getTracker().getGPUResource(),
        targets: T.fragment.targets.map((i): (GPUColorTargetState | null | undefined) => {
            if (i) {
                return {
                    blend: getBlendState(i?.blend ?? Blending.NoBlending),
                    writeMask: i.mask ?? GPUColorWrite.ALL,
                    format: i.format
                }
            }

            return i
        }),
        constants: T.fragment.constants ?? {},
    } : undefined

    const primitive = {
        cullMode: T.primitive?.cullMode ?? "none",
        stripIndexFormat: T.primitive?.stripIndexFormat,
        frontFace: T.primitive?.frontFace ?? "ccw",
        unclippedDepth: T.primitive?.unclippedDepth ?? false,
        topology: T.primitive?.topology ?? "triangle-list"
    }
    const multiSample = {
        count: T.multiSample?.count ?? 1,
        mask: T.multiSample?.mask ?? 0xFFFFFFFF,
        alphaToCoverageEnabled: T.multiSample?.alphaToCoverageEnabled ?? false,
    };
    const depthStencil: GPUDepthStencilState | undefined = T.depthStencil ? {
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

    return {
        depthStencil,
        vertex: vertexSetting,
        label,
        fragment: fragmentSetting,
        primitive,
        multisample: multiSample,
        layout: layout.getTracker().getGPUResource()
    }
}