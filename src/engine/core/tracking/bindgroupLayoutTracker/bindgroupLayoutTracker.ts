import {IndestructiveTrackedResource} from "../IndestructiveTrackedResources.ts";

export class BindgroupLayoutTracker extends IndestructiveTrackedResource {
    private layout: GPUBindGroupLayout;

    constructor(hash: string, layout: GPUBindGroupLayout) {
        super(hash);
        this.layout = layout;
    }

    getLayout() {
        return this.layout;
    }
}