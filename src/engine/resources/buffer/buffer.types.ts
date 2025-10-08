import type {TypedArray} from "three";

export type GPUBufferBaseEntries = {
    data: TypedArray,
    label: string,
}

export type UpdateDataEntries = {
    data: TypedArray,
    bufferOffset: GPUSize64,
    dataOffset?: GPUSize64,
    size?: GPUSize64
}

export type GPUVertexBufferEntries = GPUBufferBaseEntries & {

    layout: GPUVertexBufferLayout
}

export type GPUUniformBufferEntries = GPUBufferBaseEntries & {
    data: TypedArray,
    label: string,
}