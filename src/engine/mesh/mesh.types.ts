import type GPURawGeometry from "../geometry/GPURawGeometry.ts";
import type GPURawMaterial from "../material/GPURawMaterial.ts";
import type GPURawBindgroup from "../resources/bindgroup/GPURawBindgroup.ts";
import type GPURawRenderPipeline from "../resources/pipeline/GPURawRenderPipeline.ts";

export type MeshEntries = {
    geometry: GPURawGeometry,
    material: GPURawMaterial,
    bindgroup: GPURawBindgroup,
    pipeline: GPURawRenderPipeline,
    hash: string,
}

export type MeshManagerCreateEntries = {
    geometry: GPURawGeometry,
    material: GPURawMaterial,
    pipelineLabel?: string,
    pipelineLayoutLabel?: string,
    bindgroupLayoutLabel?: string,
    bindgroupLabel?: string,
}