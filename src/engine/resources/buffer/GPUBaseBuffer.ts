import type {TypedArray} from "three";
import GPURawBuffer from "./GPURawBuffer.ts";
import type {GPUBaseBufferEntries, UpdateDataEntries} from "./buffer.types.ts";
import DeviceManager from "../../core/DeviceManager.ts";

export default class GPUBaseBuffer extends GPURawBuffer {



    constructor(T:GPUBaseBufferEntries) {
        super(T);
        this.fillWithData(T.data)
    }

    private fillWithData(typedArray: TypedArray) {
        const device=DeviceManager.instance.device

        device.queue.writeBuffer(this.getTracker().getGPUResource(), 0, typedArray);
    }


    updateData(T: UpdateDataEntries) {
        const device=DeviceManager.instance.device

        if (this.getSize() === T.data.byteLength) {
            device.queue.writeBuffer(this.getTracker().getGPUResource(), T.bufferOffset, T.data, T.dataOffset, T.size);

            return true;
        }
        console.warn("new data has a bigger size then current buffer");

        return false;
    }
}