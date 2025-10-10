import {IndestructiveTrackedResource} from "../IndestructiveTrackedResources.ts";

export class PipelineLayoutTracker extends IndestructiveTrackedResource {
    private pipelineLayout: GPUPipelineLayout;

    constructor(hash: string, layout: GPUPipelineLayout) {
        super(hash);
        this.pipelineLayout = layout;
    }

    getPipelineLayout() {
        return this.pipelineLayout;
    }
}