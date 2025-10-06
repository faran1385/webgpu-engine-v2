import {getNanoId} from "../../../helpers/globalHelpler.ts";
import type {GPUBaseBindgroupLayoutEntries} from "./bindgroup.types.ts";

export default class GPURawBindgroupLayout {
    private nanoID!: string;

    private layout!: GPUBindGroupLayout;
    private entries: GPUBindGroupLayoutEntry[]
    private hash: string;
    private totalBindingNumber: number;
    private label?: string;
    private entriesWithName: GPUBaseBindgroupLayoutEntries["entries"];

    constructor(device: GPUDevice, descriptor: {
        label?: string;
        entries: GPUBaseBindgroupLayoutEntries["entries"]
    }, hash: string) {
        this.hash = hash;
        this.totalBindingNumber = Object.keys(descriptor.entries).length;
        this.label = descriptor.label;
        this.nanoID = getNanoId();
        this.entriesWithName = descriptor.entries;

        const ArrayEntries: GPUBindGroupLayoutEntry[] = []
        for (const entry in descriptor.entries) {
            ArrayEntries.push(descriptor.entries[entry]);
        }
        this.entries = ArrayEntries;

        this.createBindgroupLayout(device);
    }

    getEntry(name: string) {
        return this.entriesWithName[name];
    }

    private createBindgroupLayout(device: GPUDevice) {
        this.layout = device.createBindGroupLayout({
            entries: this.entries,
            label: this.label,
        })
    }

    getNanoID(): string {
        return this.nanoID;
    }

    getLayout() {
        return this.layout;
    }

    getLayoutEntries() {
        return this.entries;
    }

    getHash() {
        return this.hash;
    }

    getTotalBinding() {
        return this.totalBindingNumber;
    }

}