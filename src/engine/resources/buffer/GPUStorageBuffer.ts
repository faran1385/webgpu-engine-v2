import type {GPUBufferBaseEntries} from "./buffer.types.ts";
import GPUBaseBuffer from "./GPUBaseBuffer.ts";

export default class GPUStorageBuffer extends GPUBaseBuffer {
    bindType: "storage" | "read-only-storage" = "storage"

    constructor({device, data, label}: GPUBufferBaseEntries) {
        super(device, data, GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE, label);
    }
}