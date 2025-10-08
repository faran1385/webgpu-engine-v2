import type GPUVertexBuffer from "../resources/buffer/GPUVertexBuffer.ts";
import type GPUIndexBuffer from "../resources/buffer/GPUIndexBuffer.ts";

export type GeometryEntries = {
    buffers: GPUVertexBuffer[],
    primitive?: {
        topology?: GPUPrimitiveState["topology"],
        stripIndexFormat?: GPUPrimitiveState["stripIndexFormat"],
    },
    hash: string
    indexBuffer?: GPUIndexBuffer;
}