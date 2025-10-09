import GPUBaseBuffer from "./GPUBaseBuffer.ts";
import type {GPUBufferBaseEntries} from "./buffer.types.ts";

export default class GPUIndexBuffer extends GPUBaseBuffer {


    private format: GPUIndexFormat;

    constructor({data, label,isAutoDestroy}: GPUBufferBaseEntries) {
        super({
            data,
            label,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            size: data.byteLength,
            isAutoDestroy
        });
        this.format = data instanceof Uint16Array ? "uint16" : "uint32";

    }

    getFormat() {
        return this.format;
    }
}
