import type {GPUBufferBaseEntries} from "./buffer.types.ts";
import GPUBaseBuffer from "./GPUBaseBuffer.ts";

export default class GPUStorageBuffer extends GPUBaseBuffer {
    bindType: "storage" | "read-only-storage" = "storage"

    constructor({data, label,isAutoDestroy}: GPUBufferBaseEntries) {
        super({
            data,
            label,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            isAutoDestroy,
            size: data.byteLength
        });
    }
}