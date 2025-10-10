import {getNanoId} from "../../../helpers/globalHelpler.ts";
import type GPURawBindgroupLayout from "../bindgroupLayout/GPURawBindgroupLayout.ts";
import type {EntryResource, GPURawBindgroupDescriptor} from "./bindgroup.types.ts";
import {IndestructiveTrackedResource} from "../../core/tracking/IndestructiveTrackedResources.ts";
import BindgroupManager from "./BindgroupManager.ts";
import {BaseIndestructiveResourceNeeds} from "../BaseResourceNeeds.ts";
import {BindgroupTracker} from "../../core/tracking/bindgroupTracker/bindgroupTracker.ts";

export default class GPURawBindgroup extends BaseIndestructiveResourceNeeds {
    protected nanoID!: string;
    private layout: GPURawBindgroupLayout;
    private entries: GPUBindGroupEntry[];
    private totalBindingNumber: number;
    private label?: string;
    private boundResources: Record<string, EntryResource>;
    protected tracker: BindgroupTracker

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
        } else {
            this.totalBindingNumber = Array.from(descriptor.entries).length;
            this.label = descriptor.label;
            this.layout = descriptor.layout;
            this.entries = Array.from(descriptor.entries);
            this.boundResources = descriptor.boundResources;
            this.tracker = descriptor.tracker;
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
        })
    }

    getTracker() {
        return this.tracker;
    }

    destroyInternal() {
        const manager = BindgroupManager.init();
        manager.removeBindgroup(this.tracker.getHash(), this.nanoID)

        this.tracker.getDependents().forEach(dependent => {
            dependent.removeDependency(this.tracker);
        });

        this.tracker.getDependencies().forEach(dependency => {
            if (dependency instanceof IndestructiveTrackedResource) dependency.removeDependent(this.tracker);
        });

        this.layout = undefined as any;
        this.entries = [];
        this.totalBindingNumber = 0;
        this.label = undefined;
        this.boundResources = {};
        this.tracker = undefined as any;
        console.warn(`bindgroup with nano id ${this.getNanoID()} destroyed`)
    }


    getResource(name: string) {
        return this.boundResources[name];
    }

    getNanoID(): string {
        return this.nanoID;
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