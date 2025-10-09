import GPUBaseBuffer from "./GPUBaseBuffer.ts";
import type {GPUVertexBufferEntries} from "./buffer.types.ts";

export default class GPUVertexBuffer extends GPUBaseBuffer {
    private layout: GPUVertexBufferLayout;

    constructor({data, label, layout,isAutoDestroy}: GPUVertexBufferEntries) {
        super({
            data,
            label,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            isAutoDestroy,
            size: data.byteLength
        });
        this.layout = layout
    }

    getLayout() {
        return this.layout;
    }
}