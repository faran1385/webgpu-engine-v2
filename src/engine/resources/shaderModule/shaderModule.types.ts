import type {IndestructiveTrackedResource} from "../../core/tracking/IndestructiveTrackedResources.ts";

export type shaderModuleEntries = {
    code: string,
    label?: string,
    isCopy: false
    tracker:IndestructiveTrackedResource
} | {
    code: string,
    label?: string
    module: GPUShaderModule;
    isCopy: true
    tracker:IndestructiveTrackedResource
}

export type ManagerCreateEntries = {
    code: string,
    label?: string,
    isCopy: false
} | {
    code: string,
    label?: string
    module: GPUShaderModule;
    isCopy: true
}