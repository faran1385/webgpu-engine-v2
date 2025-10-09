import type {TypedArray} from "three";


export type GPURawBufferEntries = {
    size: number,
    usage: number,
    label?: string,
    isAutoDestroy?: boolean,
}

export type GPUBaseBufferEntries = {
    size: number,
    usage: number,
    label?: string,
    data: TypedArray
    isAutoDestroy?: boolean,
}

export type GPUBufferBaseEntries = {
    data: TypedArray,
    label: string,
    isAutoDestroy?: boolean,
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