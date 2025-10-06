import GPUBaseBuffer from "./GPUBaseBuffer.ts";
import type {GPUBufferBaseEntries} from "./buffer.types.ts";

export default class GPUIndexBuffer extends GPUBaseBuffer {
    private format: GPUIndexFormat;

    constructor({device, data, label}: GPUBufferBaseEntries) {
        super(device, data, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST, label);
        this.format = data instanceof Uint16Array ? "uint16" : "uint32";

    }

    getFormat() {
        return this.format;
    }
}
