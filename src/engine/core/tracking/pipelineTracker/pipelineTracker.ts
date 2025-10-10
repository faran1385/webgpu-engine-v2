import {IndestructiveTrackedResource} from "../IndestructiveTrackedResources.ts";

export class PipelineTracker extends IndestructiveTrackedResource {
    private pipeline: GPURenderPipeline;

    constructor(hash: string, pipeline: GPURenderPipeline) {
        super(hash);
        this.pipeline = pipeline;
    }

    getPipeline() {
        return this.pipeline;
    }
}
