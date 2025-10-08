import GPUBaseBuffer from "./GPUBaseBuffer.ts";
import type {GPUVertexBufferEntries} from "./buffer.types.ts";

export default class GPUVertexBuffer extends GPUBaseBuffer {
    private layout: GPUVertexBufferLayout;

    constructor({data, label, layout}: GPUVertexBufferEntries) {
        super(data, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, label);
        this.layout = layout
    }

    getLayout() {
        return this.layout;
    }
}