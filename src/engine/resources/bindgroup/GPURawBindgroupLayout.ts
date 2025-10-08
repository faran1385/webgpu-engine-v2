import {getNanoId} from "../../../helpers/globalHelpler.ts";
import type {
    GPUBaseBindgroupLayoutEntries,
    GPUBindGroupManagerCreateEntries,
    GPURawBindgroupLayoutDescriptor
} from "./bindgroup.types.ts";
import {TrackedResource} from "../../core/tracking/TrackedResources.ts";
import {getLayoutEntries, hashBindgroupLayout} from "../../../helpers/bindgroupHelper.ts";
import DeviceManager from "../../core/DeviceManager.ts";
import GPUBindgroupManager from "./GPUBindgroupManager.ts";

export default class GPURawBindgroupLayout {
    private nanoID!: string;

    private tracker: TrackedResource
    private layout!: GPUBindGroupLayout;
    private entries: GPUBindGroupLayoutEntry[]
    private totalBindingNumber: number;
    private bindgroupLayoutLabel?: string;
    private entriesWithName: GPUBaseBindgroupLayoutEntries["entries"];

    constructor(descriptor: GPURawBindgroupLayoutDescriptor) {
        this.nanoID = getNanoId();

        this.tracker = descriptor.tracker;
        if (descriptor.isCopy) {
            this.totalBindingNumber = descriptor.totalBindingNumber;
            this.bindgroupLayoutLabel = descriptor.bindgroupLayoutLabel;
            this.entriesWithName = descriptor.entriesWithName;
            this.layout = descriptor.layout;
            this.entries = descriptor.entries;
        } else {
            this.totalBindingNumber = Object.keys(descriptor.entries).length;
            this.bindgroupLayoutLabel = descriptor.label;
            this.entriesWithName = descriptor.entries;

            const ArrayEntries: GPUBindGroupLayoutEntry[] = []
            for (const entry in descriptor.entries) {
                ArrayEntries.push(descriptor.entries[entry]);
            }
            this.entries = ArrayEntries;

            this.createBindgroupLayout();
        }
    }

    private getRecordFromEntries() {
        const record: Record<string, GPUBindGroupLayoutEntry> = {}

        for (const entry in this.entries) {
            record[entry] = this.entries[entry];
        }

        return record;
    }


    computeHash(): string {
        return hashBindgroupLayout(this.getRecordFromEntries())
    }

    getEntry(name: string) {
        return this.entriesWithName[name];
    }

    private createBindgroupLayout() {
        const device = DeviceManager.instance.device
        this.layout = device.createBindGroupLayout({
            entries: this.entries,
            label: this.bindgroupLayoutLabel,
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


    getTotalBinding() {
        return this.totalBindingNumber;
    }

    destroyInternal() {
        const manager = GPUBindgroupManager.init();
        manager.removeLayout(this.tracker.getHash(), this.nanoID)

        this.tracker.getDependents().forEach(dependent => {
            dependent.removeDependency(this.tracker);
        });

        this.tracker.getDependencies().forEach(dependency => {
            dependency.removeDependent(this.tracker);
        });

        this.tracker = undefined as any;
        this.layout = undefined as any;
        this.totalBindingNumber = 0;
        this.entries = [];
        this.entriesWithName = {};
        this.bindgroupLayoutLabel = undefined;
    }

    setEntries(resources: GPUBindGroupManagerCreateEntries["resources"]) {
        const entries = getLayoutEntries(resources);
        const entriesWithName = entries;

        const ArrayEntries: GPUBindGroupLayoutEntry[] = []
        for (const entry in entries) {
            ArrayEntries.push(entries[entry]);
        }


        this.entries = ArrayEntries;
        this.entriesWithName = entriesWithName;
        console.log(
            this.computeHash()
        )
        this.createBindgroupLayout();
    }


    clone() {
        return new GPURawBindgroupLayout({
            isCopy: true,
            bindgroupLayoutLabel: this.bindgroupLayoutLabel,
            entries: this.entries,
            entriesWithName: this.entriesWithName,
            totalBindingNumber: this.totalBindingNumber,
            layout: this.layout,
            tracker: this.tracker
        })
    }

    getTracker() {
        return this.tracker;
    }
}

