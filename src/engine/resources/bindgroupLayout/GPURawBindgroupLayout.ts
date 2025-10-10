import {getNanoId} from "../../../helpers/globalHelpler.ts";
import type {
    GPUBaseBindgroupLayoutEntries,
    GPUBindGroupManagerCreateEntries,
    GPURawBindgroupLayoutDescriptor
} from "../bindgroup/bindgroup.types.ts";
import {getLayoutEntries} from "../../../helpers/bindgroupHelper.ts";
import {BindgroupLayoutTracker} from "../../core/tracking/bindgroupLayoutTracker/bindgroupLayoutTracker.ts";
import BindgroupLayoutManager from "./BindgroupLayoutManager.ts";

export default class GPURawBindgroupLayout {
    private nanoID!: string;
    private manager: BindgroupLayoutManager;
    private tracker: BindgroupLayoutTracker
    private entries: GPUBindGroupLayoutEntry[]
    private totalBindingNumber: number;
    private label?: string;
    private entriesWithName: GPUBaseBindgroupLayoutEntries["entries"];

    constructor(descriptor: GPURawBindgroupLayoutDescriptor) {
        this.nanoID = getNanoId();
        this.manager = BindgroupLayoutManager.init();
        this.tracker = descriptor.tracker;
        if (descriptor.isCopy) {
            this.totalBindingNumber = descriptor.totalBindingNumber;
            this.label = descriptor.bindgroupLayoutLabel;
            this.entriesWithName = descriptor.entriesWithName;
            this.entries = descriptor.entries;
        } else {
            this.totalBindingNumber = Object.keys(descriptor.entries).length;
            this.label = descriptor.label;
            this.entriesWithName = descriptor.entries;

            const ArrayEntries: GPUBindGroupLayoutEntry[] = []
            for (const entry in descriptor.entries) {
                ArrayEntries.push(descriptor.entries[entry]);
            }
            this.entries = ArrayEntries;
        }
    }


    setEntries(T: GPUBindGroupManagerCreateEntries["resources"]) {
        const entries = getLayoutEntries(T);
        this.totalBindingNumber = Object.keys(entries).length;
        this.entriesWithName = entries;

        const ArrayEntries: GPUBindGroupLayoutEntry[] = []
        for (const entry in entries) {
            ArrayEntries.push(entries[entry]);
        }
        this.entries = ArrayEntries;
        this.update()
    }

    private getRecordFromEntries() {
        const record: Record<string, GPUBindGroupLayoutEntry> = {}

        for (const entry in this.entries) {
            record[entry] = this.entries[entry];
        }

        return record;
    }

    update() {
        const oldHash = this.getTracker().getHash();
        const newHash = this.manager.compileHash(this.getRecordFromEntries());

        if (oldHash === newHash) return;


        this.manager.removeLayout(oldHash, this.nanoID)

        let cachedInfo = this.manager.getCachedInfoByHash(newHash);
        if (!cachedInfo) {

            const record = this.getRecordFromEntries();
            const gpuLayout = this.manager.createGPULayout(this.label, record);
            const tracker = new BindgroupLayoutTracker(newHash, gpuLayout);

            this.manager.addToCache(newHash, {
                wrapperClasses: new Map([[this.nanoID, this]]),
                tracker,
            })
            this.tracker = tracker;
        } else {
            this.tracker = cachedInfo?.tracker;
            cachedInfo.wrapperClasses.set(this.nanoID, this);
        }
    }


    getEntry(name: string) {
        return this.entriesWithName[name];
    }

    getNanoID(): string {
        return this.nanoID;
    }


    getLayoutEntries() {
        return this.entries;
    }


    getTotalBinding() {
        return this.totalBindingNumber;
    }

    destroyInternal() {
        this.manager.removeLayout(this.tracker.getHash(), this.nanoID)

        this.tracker.getDependents().forEach(dependent => {
            dependent.removeDependency(this.tracker);
        });

        this.tracker = undefined as any;
        this.totalBindingNumber = 0;
        this.entries = [];
        this.entriesWithName = {};
        this.label = undefined;
        console.warn(`bindgroup layout with nano id ${this.getNanoID()} destroyed`)
    }


    clone() {
        return new GPURawBindgroupLayout({
            isCopy: true,
            bindgroupLayoutLabel: this.label,
            entries: this.entries,
            entriesWithName: this.entriesWithName,
            totalBindingNumber: this.totalBindingNumber,
            tracker: this.tracker
        })
    }

    getTracker() {
        return this.tracker;
    }
}

