import type {TypedArray} from "three";
import GPURawBuffer from "./GPURawBuffer.ts";
import type {UpdateDataEntries} from "./buffer.types.ts";

export default class GPUBaseBuffer extends GPURawBuffer {

    constructor(device: GPUDevice, typedArray: TypedArray, usage: number, label: string) {
        super(device, typedArray.byteLength, usage, label);
        this.fillWithData(device, typedArray)
    }

    private fillWithData(device: GPUDevice, typedArray: TypedArray) {
        device.queue.writeBuffer(this.getGPUBuffer(), 0, typedArray);
    }


    updateData(T: UpdateDataEntries) {
        if (this.getSize() === T.data.byteLength) {
            T.device.queue.writeBuffer(this.getGPUBuffer(), T.bufferOffset, T.data, T.dataOffset, T.size);

            return true;
        }
        console.warn("new data has a bigger size then current buffer");

        return false;
    }
}