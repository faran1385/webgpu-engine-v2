import {getNanoId} from "../../../helpers/globalHelpler.ts";
import type GPURawBindgroupLayout from "../bindgroupLayout/GPURawBindgroupLayout.ts";
import {BaseIndestructiveResourceNeeds} from "../BaseResourceNeeds.ts";
import {PipelineLayoutTracker} from "../../core/tracking/pipelineLayoutTracker/pipelineLayoutTracker.ts";
import type {
    GPURawPipelineLayoutEntries,
    PipelineLayoutChild,
    PipelineLayoutGraph,
    PipelineLayoutParent
} from "./pipelineLayout.types.ts";
import PipelineLayoutManager from "./PipelineLayoutManager.ts";
import ResourceUpdater from "../../core/resourceUpdater/ResourceUpdater.ts";


export default class GPURawPipelineLayout extends BaseIndestructiveResourceNeeds {
    private boundedBindGroupLayouts: GPURawBindgroupLayout[]
    protected nanoID!: string;
    private label?: string
    protected tracker: PipelineLayoutTracker
    private graph: PipelineLayoutGraph = {
        parents: new Set(),
        children: new Set()
    }
    needsUpdate: boolean = false;
    private manager: PipelineLayoutManager;
    private resourceUpdater: ResourceUpdater;

    private updateTo: null | {
        label?: string
        boundedBindGroupLayouts: GPURawBindgroupLayout[]
    } = null
    isBuilt: boolean = true;

    constructor(T: GPURawPipelineLayoutEntries) {
        super();
        this.resourceUpdater= ResourceUpdater.init();
        this.manager = PipelineLayoutManager.init()
        this.nanoID = getNanoId();
        this.boundedBindGroupLayouts = T.bindgroupLayouts
        this.label = T.label;
        this.tracker = T.tracker;

    }

    private applyUpdates() {
        this.boundedBindGroupLayouts = this.updateTo?.boundedBindGroupLayouts! ?? this.boundedBindGroupLayouts;
        this.label = this.updateTo?.label;

        this.updateTo = null;
        this.isBuilt = true;
        this.needsUpdate = false;
    }

    getManager() {
        return this.manager
    }

    setBoundedLayouts(boundedBindGroupLayouts: GPURawBindgroupLayout[]){

        const newHash = this.manager.compileHash(boundedBindGroupLayouts);
        this.updateTo = {
            boundedBindGroupLayouts,
            label: this.label,
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

    rebuild() {
        const bounded = this.updateTo?.boundedBindGroupLayouts ?? this.boundedBindGroupLayouts;
        const hash = this.manager.compileHash(bounded)
        ResourceUpdater.init().addToIndestructiveDeleteQueue(this,this.getTracker().getHash());

        this.tracker = this.manager.createOrGetTracker(hash, this);

        this.applyUpdates()
    }


    getUpdateTo() {
        return this.updateTo
    }

    clone(boundedBindGroups: GPURawBindgroupLayout[]) {
        return new GPURawPipelineLayout({
            label: this.label,
            tracker: this.tracker,
            bindgroupLayouts: boundedBindGroups,
        })
    }

    getGraph() {
        return this.graph;
    }

    getLabel() {
        return this.label
    }

    addChild(child: PipelineLayoutChild) {
        this.graph.children.add(child);
    }

    addParent(parent: PipelineLayoutParent) {
        this.graph.parents.add(parent);
    }

    destroyInternal() {
    }


    getTracker() {
        return this.tracker;
    }

    getBoundedBindGroups(): GPURawBindgroupLayout[] {
        return this.boundedBindGroupLayouts
    }

    getNanoID(): string {
        return this.nanoID;
    }
}