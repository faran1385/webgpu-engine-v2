import {getNanoId} from "../../../helpers/globalHelpler.ts";
import type {shaderModuleEntries} from "./shaderModule.types.ts";

export default class GPURawShaderModule {
    private nanoID!: string;
    private code: string
    private label?: string;
    private module!: GPUShaderModule;


    constructor(device: GPUDevice, T: shaderModuleEntries) {
        this.nanoID = getNanoId();

        this.code = T.code;
        this.label = T.label

        this.createModule(device)
    }

    private createModule(device: GPUDevice) {
        this.module = device.createShaderModule({
            code: this.code,
            label: this.label,
        })
    }

    getModule() {
        return this.module;
    }

    getCode(): string {
        return this.code;
    }

    getNanoID(): string {
        return this.nanoID;
    }
}