import {DestructiveTrackedResource} from "../destructiveTrackedResources.ts";

export default class BufferTracker extends DestructiveTrackedResource {
    private buffer: GPUBuffer;

    constructor(buffer: GPUBuffer, isAutoDestroy: boolean) {
        super(isAutoDestroy)
        this.buffer = buffer;
    }

    getGPUResource() {
        return this.buffer;
    }

    destroy() {
        this.destroyStatus = true;
        this.buffer.destroy();
    }
}