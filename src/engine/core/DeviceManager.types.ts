export type InitEntries = {
    adapterOptions?: GPURequestAdapterOptions,
    deviceOptions?: {
        requiredFeatures?: Iterable<GPUFeatureName>
        requiredLimits?: Record<string, GPUSize64>,
        defaultQueueDescriptor?: GPUObjectDescriptorBase
    }
}

export type DeviceLostFunction = (e: GPUDeviceLostInfo) => void