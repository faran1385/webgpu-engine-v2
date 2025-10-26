import {IndestructiveTrackedResource} from "../IndestructiveTrackedResources.ts";

export class ShaderModuleTracker extends IndestructiveTrackedResource {
    private module: GPUShaderModule;

    constructor(hash: string, module: GPUShaderModule) {
        super(hash);
        this.module = module;
    }

    getGPUResource() {
        return this.module;
    }
}