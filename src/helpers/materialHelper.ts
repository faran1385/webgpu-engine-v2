import {Blending, type GPURawPipelineEntries} from "../engine/resources/pipeline/pipeline.types.ts";
import type {EntryResource} from "../engine/resources/bindgroup/bindgroup.types.ts";
import {fnv1aHash} from "./globalHelpler.ts";

export function getMaterialHash(T:{
    vertex: {
        module: GPURawPipelineEntries["vertex"]["module"]
        entryPoint?: GPURawPipelineEntries["vertex"]["entryPoint"]
        constants?: GPURawPipelineEntries["vertex"]["constants"]
    },
    fragment?: GPURawPipelineEntries["fragment"],
    multiSample?: GPURawPipelineEntries["multiSample"],
    depthStencil?: GPURawPipelineEntries["depthStencil"],
    primitive?: {
        frontFace?:GPUPrimitiveState["frontFace"],
        cullMode?:GPUPrimitiveState["cullMode"],
        unclippedDepth?:GPUPrimitiveState["unclippedDepth"],
    },
    resources: Record<string, {
        resource: EntryResource,
        visibility: number
    }>,
}){
    // === Vertex Stage ===
    let vertexHash = [
        `vModule:${T.vertex.module.getNanoID()}`,
        `entryPoint:${T.vertex.entryPoint}`,
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
        `frontFace:${T.primitive?.frontFace ?? "ccw"}`,
        `unclippedDepth:${T.primitive?.unclippedDepth ?? false}`,
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
        `vertex:${vertexHash}`,
        `fragment:${fragmentHash}`,
        `primitive:${primitive}`,
        `depthStencil:${depthStencil}`,
        `multiSample:${multisample}`,
    ].join("||");

    // Return as string (in hex for readability)
    return fnv1aHash(finalString);
}