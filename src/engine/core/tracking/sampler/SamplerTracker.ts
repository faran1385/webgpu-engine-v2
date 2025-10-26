import {IndestructiveTrackedResource} from "../IndestructiveTrackedResources.ts";

export class SamplerTracker extends IndestructiveTrackedResource {
    private sampler: GPUSampler;

    constructor(hash: string, sampler: GPUSampler) {
        super(hash);
        this.sampler = sampler;

    }

    getGPUResource() {
        return this.sampler;
    }
}
