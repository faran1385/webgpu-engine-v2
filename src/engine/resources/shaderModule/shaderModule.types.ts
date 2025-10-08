import type {TrackedResource} from "../../core/tracking/TrackedResources.ts";

export type shaderModuleEntries = {
    code: string,
    label?: string,
    isCopy: false
    tracker:TrackedResource
} | {
    code: string,
    label?: string
    module: GPUShaderModule;
    isCopy: true
    tracker:TrackedResource
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