import GPUBaseBuffer from "./GPUBaseBuffer.ts";
import type {GPUUniformBufferEntries} from "./buffer.types.ts";
import type {TypedArrayConstructor} from "three";

export default class GPUUniformBuffer extends GPUBaseBuffer {
    readonly bindType = "uniform"

    constructor({device, data, label}: GPUUniformBufferEntries) {

        // align to 16
        const alignedSize = Math.ceil(data.byteLength / 16) * 16;
        const alignedData = new (data.constructor as TypedArrayConstructor)(alignedSize / 4);
        alignedData.set(data)

        super(device, alignedData, GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM, label);

    }


}