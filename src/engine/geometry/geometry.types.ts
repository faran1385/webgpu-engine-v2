import type GPUVertexBuffer from "../resources/buffer/GPUVertexBuffer.ts";

export type GeometryEntries = {
    buffers: GPUVertexBuffer[],
    primitive?: {
        topology?: GPUPrimitiveState["topology"],
        stripIndexFormat?: GPUPrimitiveState["stripIndexFormat"],
    },
    hash: string
}