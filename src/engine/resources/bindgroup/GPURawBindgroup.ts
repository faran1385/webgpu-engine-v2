import {getNanoId} from "../../../helpers/globalHelpler.ts";
import type GPURawBindgroupLayout from "./GPURawBindgroupLayout.ts";
import type {EntryResource, GPURawBindgroupDescriptor} from "./bindgroup.types.ts";
import GPURawBuffer from "../buffer/GPURawBuffer.ts";
import {GPURawTexture} from "../texture/GPURawTexture.ts";
import DeviceManager from "../../core/DeviceManager.ts";
import type {TrackedResource} from "../../core/tracking/TrackedResources.ts";
import GPUBindgroupManager from "./GPUBindgroupManager.ts";
import BaseResourceNeeds from "../BaseResourceNeeds.ts";

export default class GPURawBindgroup extends BaseResourceNeeds {
    protected nanoID!: string;
    private layout: GPURawBindgroupLayout;
    private entries: GPUBindGroupEntry[];
    private totalBindingNumber: number;
    private label?: string;
    private bindgroup!: GPUBindGroup;
    private boundResources: Record<string, EntryResource>;
    protected tracker: TrackedResource

    constructor(descriptor: GPURawBindgroupDescriptor) {
        super();
        this.nanoID = getNanoId();

        if (descriptor.isCopy) {
            this.totalBindingNumber = descriptor.totalBindingNumber;
            this.label = descriptor.label;
            this.layout = descriptor.layout;
            this.entries = descriptor.entries;
            this.boundResources = descriptor.boundResources;
            this.tracker = descriptor.tracker;
            this.bindgroup = descriptor.bindgroup;
        } else {
            this.totalBindingNumber = Array.from(descriptor.entries).length;
            this.label = descriptor.label;
            this.layout = descriptor.layout;
            this.entries = Array.from(descriptor.entries);
            this.boundResources = descriptor.boundResources;
            this.tracker = descriptor.tracker;
            this.createBindgroup();
        }
    }

    clone() {
        return new GPURawBindgroup({
            isCopy: true,
            entries: this.entries,
            totalBindingNumber: this.totalBindingNumber,
            layout: this.layout,
            tracker: this.tracker,
            label: this.label,
            boundResources: this.boundResources,
            bindgroup: this.bindgroup
        })
    }

    getTracker(): TrackedResource {
        return this.tracker;
    }

    destroyInternal() {
        const manager = GPUBindgroupManager.init();
        manager.removeBindgroup(this.tracker.getHash(), this.nanoID)

        this.tracker.getDependents().forEach(dependent => {
            dependent.removeDependency(this.tracker);
        });

        this.tracker.getDependencies().forEach(dependency => {
            dependency.removeDependent(this.tracker);
        });

        this.layout = undefined as any;
        this.entries = [];
        this.totalBindingNumber = 0;
        this.label = undefined;
        this.bindgroup = undefined as any;
        this.boundResources = {};
        this.tracker = undefined as any;
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

    regroup() {
        this.entries = this.getBindgroupEntries();
        this.createBindgroup()
    }

    getResource(name: string) {
        return this.boundResources[name];
    }

    private createBindgroup() {
        const device = DeviceManager.instance.device
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

    getTotalBinding() {
        return this.totalBindingNumber;
    }

}