import {getNanoId} from "../../../helpers/globalHelpler.ts";
import type GPURawBindgroupLayout from "./GPURawBindgroupLayout.ts";
import type {EntryResource} from "./bindgroup.types.ts";
import GPURawBuffer from "../buffer/GPURawBuffer.ts";
import {GPURawTexture} from "../texture/GPURawTexture.ts";

export default class GPURawBindgroup {
    private nanoID!: string;
    private layout: GPURawBindgroupLayout;
    private entries: GPUBindGroupEntry[]
    private hash: string;
    private totalBindingNumber: number;
    private label?: string;
    private bindgroup!: GPUBindGroup;
    private boundResources: Record<string, EntryResource>;

    constructor(device: GPUDevice, descriptor: {
        entries: Iterable<GPUBindGroupEntry>,
        layout: GPURawBindgroupLayout,
        label?: string,
        boundResources:Record<string, EntryResource>
    }, hash: string) {
        this.hash = hash;
        this.totalBindingNumber = Array.from(descriptor.entries).length;
        this.label = descriptor.label;
        this.layout = descriptor.layout;
        this.entries = Array.from(descriptor.entries);
        this.nanoID = getNanoId();
        this.boundResources = descriptor.boundResources;
        this.createBindgroup(device);
    }

    private getBindgroupEntries() {
        const entries: GPUBindGroupEntry[] = []
        for (const key in this.boundResources) {
            const {binding} = this.getLayout().getEntry(key)!
            const resource = this.boundResources[key];

            if (resource instanceof GPURawBuffer) {
                entries.push({
                    resource: {
                        buffer: resource.getGPUBuffer()
                    },
                    binding
                })
            } else if (resource instanceof GPURawTexture) {
                entries.push({
                    resource: resource.getTexture().createView({
                        dimension: resource.getViewDimension(),
                    }),
                    binding
                })
            } else {
                entries.push({
                    resource: resource.getSampler(),
                    binding
                })
            }
        }

        return entries
    }

    regroup(device: GPUDevice) {
        this.entries = this.getBindgroupEntries();
        this.createBindgroup(device)
    }

    getResource(name:string){
        return this.boundResources[name];
    }

    private createBindgroup(device: GPUDevice) {
        this.bindgroup = device.createBindGroup({
            entries: this.entries,
            label: this.label,
            layout: this.layout.getLayout()
        })
    }


    getNanoID(): string {
        return this.nanoID;
    }

    getGPUBindgroup() {
        return this.bindgroup
    }

    getLayout() {
        return this.layout;
    }

    getEntries() {
        return this.entries;
    }

    getHash() {
        return this.hash;
    }

    getTotalBinding() {
        return this.totalBindingNumber;
    }

}