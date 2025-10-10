import {IndestructiveTrackedResource} from "../IndestructiveTrackedResources.ts";

export class BindgroupTracker extends IndestructiveTrackedResource {
    private bindgroup: GPUBindGroup;

    constructor(hash: string, bindgroup: GPUBindGroup) {
        super(hash);
        this.bindgroup = bindgroup;
    }

    getBindgroup() {
        return this.bindgroup;
    }
}