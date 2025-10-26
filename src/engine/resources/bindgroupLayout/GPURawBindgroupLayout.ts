import {convertRecordToArray, getNanoId} from "../../../helpers/globalHelpler.ts";
import type {
    GPUBaseBindgroupLayoutEntries,
    GPUBindGroupManagerCreateEntries,
} from "../bindgroup/bindgroup.types.ts";
import {getLayoutEntries} from "../../../helpers/bindgroupHelper.ts";
import {BindgroupLayoutTracker} from "../../core/tracking/bindgroupLayoutTracker/bindgroupLayoutTracker.ts";
import BindgroupLayoutManager from "./BindgroupLayoutManager.ts";
import type {
    BindgroupLayoutChild,
    BindgroupLayoutGraph,
    GPURawBindgroupLayoutDescriptor
} from "./bindgroupLayout.types.ts";
import ResourceUpdater from "../../core/resourceUpdater/ResourceUpdater.ts";
import {BaseIndestructiveResourceNeeds} from "../BaseResourceNeeds.ts";


export default class GPURawBindgroupLayout extends BaseIndestructiveResourceNeeds {
    protected nanoID!: string;
    protected tracker: BindgroupLayoutTracker
    private entries: GPUBindGroupLayoutEntry[]
    private totalBindingNumber: number;
    private label?: string;
    private entriesWithName: GPUBaseBindgroupLayoutEntries["entries"];
    private manager: BindgroupLayoutManager;
    private resourceUpdater: ResourceUpdater;
    private graph: BindgroupLayoutGraph = {
        parents: null,
        children: new Set()
    }
    private updateTo: null | {
        entries: GPUBindGroupLayoutEntry[]
        totalBindingNumber: number;
        label?: string;
        entriesWithName: GPUBaseBindgroupLayoutEntries["entries"];
    } = null

    needsUpdate = false;
    isBuilt: boolean = true;

    constructor(descriptor: GPURawBindgroupLayoutDescriptor) {
        super();
        this.nanoID = getNanoId();
        this.tracker = descriptor.tracker;
        this.manager = BindgroupLayoutManager.init();
        this.resourceUpdater = ResourceUpdater.init();
        if (descriptor.isCopy) {
            this.totalBindingNumber = descriptor.totalBindingNumber;
            this.label = descriptor.bindgroupLayoutLabel;
            this.entriesWithName = descriptor.entriesWithName;
            this.entries = descriptor.entries;
        } else {
            this.totalBindingNumber = Object.keys(descriptor.entries).length;
            this.label = descriptor.label;
            this.entriesWithName = descriptor.entries;
            this.entries = convertRecordToArray(descriptor.entries);
        }
    }

    getManager() {
        return this.manager
    }

    private applyUpdates() {
        this.entriesWithName = this.updateTo?.entriesWithName! ?? this.entriesWithName;
        this.entries = this.updateTo?.entries! ?? this.entries;
        this.totalBindingNumber = this.updateTo?.totalBindingNumber! ?? this.totalBindingNumber;
        this.label = this.updateTo?.label;

        this.updateTo = null;
        this.isBuilt = true;
        this.needsUpdate = false;
    }

    rebuild() {
        this.applyUpdates()
        const hash = this.manager.compileHash(this.updateTo?.entriesWithName ?? this.entriesWithName);
        ResourceUpdater.init().addToIndestructiveDeleteQueue(this,this.getTracker().getHash());
        this.tracker = this.manager.createOrGetTracker(hash, this);
    }

    getLabel() {
        return this.label
    }

    addChild(child: BindgroupLayoutChild) {
        this.graph.children.add(child)
    }

    getUpdateTo() {
        return this.updateTo
    }

    getGraph() {
        return this.graph;
    }

    setEntries(T: GPUBindGroupManagerCreateEntries["resources"]) {
        const entries = getLayoutEntries(T);
        const newHash = this.manager.compileHash(entries);

        this.updateTo = {
            entries: convertRecordToArray(entries),
            entriesWithName: entries,
            totalBindingNumber: Object.keys(entries).length,
        }
        if (newHash === this.tracker.getHash()) {
            this.resourceUpdater.removeFromUpdateQueue(this)
            this.updateTo = null
            this.needsUpdate = false;
        } else {

            this.needsUpdate = true;
            this.resourceUpdater.addToUpdateQueue(this)
        }
    }


    setLabel(label: string | undefined) {
        this.label = label;
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
    }


    clone() {
        return new GPURawBindgroupLayout({
            isCopy: true,
            bindgroupLayoutLabel: this.label,
            entries: this.entries,
            entriesWithName: this.entriesWithName,
            totalBindingNumber: this.totalBindingNumber,
            tracker: this.tracker,
        })
    }

    getTracker() {
        return this.tracker;
    }
}

