export type GPUTextureRawEntries = {
    device: GPUDevice,
    label: string,
    depthOrArrayLayers: number,
    width: number,
    height: number
    usage: number,
    format: GPUTextureFormat,
    sampleCount?: number
    mipmapCount?: number
}

export type GPUBaseTextureEntries = {
    device: GPUDevice,
    label: string,
    width: number,
    height: number
    usage: number,
    format: GPUTextureFormat,
    sampleCount?: number,
    mipmapCount?: number
}


export type GPURenderTargetTextureEntries = {
    device: GPUDevice,
    label: string,
    width: number,
    height: number
    format: GPUTextureFormat,
    sampleCount?: number
}

export type GPUBaseTextureArrayEntries = {
    device: GPUDevice,
    label: string,
    width: number,
    height: number
    format: GPUTextureFormat,
    depthOrArrayLayers: number,
    mipmapCount?: number
    data: Uint8ClampedArray[]
}

export type GPUImageTextureEntries = {
    device: GPUDevice,
    label: string,
    width: number,
    height: number
    format: GPUTextureFormat,
    sampleCount?: number,
    data: Uint8ClampedArray,
    mipmapCount?: number
}


export type TextureMangerCreateTextureArrayOptions = {
    label?: string,
    format?: GPUTextureFormat,
    mipmapCount?: number
}


export type TextureMangerCreateTextureOptions = {
    label?: string,
    format?: GPUTextureFormat,
    mipmapCount?: number
    sampleCount?: number,
}