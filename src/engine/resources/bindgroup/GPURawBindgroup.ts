import {getNanoId} from "../../../helpers/globalHelpler.ts";
import type GPURawBindgroupLayout from "../bindgroupLayout/GPURawBindgroupLayout.ts";
import type {
    BindgroupGraph,
    BindgroupParent,
    EntryResource, GPUBindGroupManagerCreateEntries,
    GPURawBindgroupDescriptor
} from "./bindgroup.types.ts";
import {BaseIndestructiveResourceNeeds} from "../BaseResourceNeeds.ts";
import {BindgroupTracker} from "../../core/tracking/bindgroupTracker/bindgroupTracker.ts";
import BindgroupManager from "./BindgroupManager.ts";
import ResourceUpdater from "../../core/resourceUpdater/ResourceUpdater.ts";
import {getResourcesWidthBinding} from "../../../helpers/bindgroupHelper.ts";

export default class GPURawBindgroup extends BaseIndestructiveResourceNeeds {
    protected nanoID!: string;
    private layout: GPURawBindgroupLayout;
    private entries: GPUBindGroupEntry[];
    private totalBindingNumber: number;
    private label?: string;
    private boundResources: Record<string, EntryResource>;
    protected tracker: BindgroupTracker
    private manager: BindgroupManager;
    private resourceUpdater: ResourceUpdater
    private graph: BindgroupGraph = {
        parents: new Set(),
        children: null
    }
    private updateTo: null | {
        entries: GPUBindGroupEntry[];
        totalBindingNumber: number;
        label?: string;
        boundResources: Record<string, EntryResource>;
    } = null

    needsUpdate: boolean = false;
    isBuilt: boolean = true;

    constructor(descriptor: GPURawBindgroupDescriptor) {
        super();
        this.resourceUpdater = ResourceUpdater.init();
        this.nanoID = getNanoId();
        this.manager = BindgroupManager.init();

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

    getManager() {
        return this.manager
    }

    private applyUpdates() {
        this.boundResources = this.updateTo?.boundResources! ?? this.boundResources;
        this.entries = this.updateTo?.entries! ?? this.entries;
        this.totalBindingNumber = this.updateTo?.totalBindingNumber! ?? this.totalBindingNumber;
        this.label = this.updateTo?.label;

        this.updateTo = null;
        this.isBuilt = true;
        this.needsUpdate = false;
    }


    rebuild() {
        this.applyUpdates()
        const hash = this.manager.compileHash(this.layout, this.updateTo?.boundResources ?? this.boundResources)
        ResourceUpdater.init().addToIndestructiveDeleteQueue(this,this.getTracker().getHash());
        this.tracker = this.manager.createOrGetTracker(hash, this);
    }

    setEntries(T: GPUBindGroupManagerCreateEntries["resources"]) {
        const bindgroupEntries = this.manager.getBindgroupEntries(getResourcesWidthBinding(T))

        const newHash = this.manager.compileHash(this.layout, bindgroupEntries.boundResources);
        this.updateTo = {
            entries: bindgroupEntries.entries,
            totalBindingNumber: bindgroupEntries.entries.length,
            label: this.label,
            boundResources: bindgroupEntries.boundResources
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

    getGraph() {
        return this.graph;
    }

    getLabel() {
        return this.label;
    }

    getUpdateTo() {
        return this.updateTo;
    }

    clone(layout: GPURawBindgroupLayout) {
        return new GPURawBindgroup({
            isCopy: true,
            entries: this.entries,
            totalBindingNumber: this.totalBindingNumber,
            layout,
            tracker: this.tracker,
            label: this.label,
            boundResources: this.boundResources,
        })
    }

    getTracker() {
        return this.tracker;
    }

    destroyInternal() {
    }

    addParent(parent: BindgroupParent) {
        this.graph.parents.add(parent);
    }

    removeParent(parent: BindgroupParent) {
        this.graph.parents.delete(parent);
    }


    getResource(name: string) {
        return this.boundResources[name];
    }

    getBoundedResources() {
        return this.boundResources
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