import {getNanoId} from "../../../helpers/globalHelpler.ts";
import type {GPURawPipelineLayoutEntries} from "./pipeline.types.ts";
import type GPURawBindgroupLayout from "../bindgroup/GPURawBindgroupLayout.ts";

export default class GPURawPipelineLayout {
    private boundedBindGroups: GPURawBindgroupLayout[]
    private nanoID!: string;
    private hash: string;
    private pipelineLayout!: GPUPipelineLayout;
    private label?: string

    constructor(device: GPUDevice, T: GPURawPipelineLayoutEntries) {
        this.nanoID = getNanoId();
        this.boundedBindGroups = T.bindgroupLayouts
        this.hash = T.hash;
        this.label = T.label;

        this.createPipelineLayout(device)
    }

    private createPipelineLayout(device: GPUDevice) {
        this.pipelineLayout = device.createPipelineLayout({
            label: this.label,
            bindGroupLayouts: this.boundedBindGroups.map((i) => i.getLayout())
        })
    }

    getPipelineLayout(){
        return this.pipelineLayout;
    }

    getBoundedBindGroups(): GPURawBindgroupLayout[] {
        return this.boundedBindGroups
    }

    getHash() {
        return this.hash
    }

    getNanoID(): string {
        return this.nanoID;
    }
}