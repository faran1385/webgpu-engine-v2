import {getNanoId} from "../../../helpers/globalHelpler.ts";
import type {GPURawPipelineLayoutEntries} from "./pipeline.types.ts";
import type GPURawBindgroupLayout from "../bindgroupLayout/GPURawBindgroupLayout.ts";
import  {IndestructiveTrackedResource} from "../../core/tracking/IndestructiveTrackedResources.ts";
import GPURenderPipelineManager from "./GPURenderPipelineManager.ts";
import {BaseIndestructiveResourceNeeds} from "../BaseResourceNeeds.ts";
import {PipelineLayoutTracker} from "../../core/tracking/pipelineLayoutTracker/pipelineLayoutTracker.ts";

export default class GPURawPipelineLayout extends BaseIndestructiveResourceNeeds{
    private boundedBindGroups: GPURawBindgroupLayout[]
    protected nanoID!: string;
    private label?: string
    protected tracker: PipelineLayoutTracker

    constructor(T: GPURawPipelineLayoutEntries) {
        super();
        this.nanoID = getNanoId();
        this.boundedBindGroups = T.bindgroupLayouts
        this.label = T.label;
        this.tracker = T.tracker;
    }

    clone() {
        return new GPURawPipelineLayout({
            label: this.label,
            tracker: this.tracker,
            bindgroupLayouts: this.boundedBindGroups
        })
    }

    destroyInternal() {
        const manager = GPURenderPipelineManager.init();
        manager.removeLayout(this.tracker.getHash(), this.nanoID)

        this.tracker.getDependents().forEach(dependent => {
            dependent.removeDependency(this.tracker);
        });

        this.tracker.getDependencies().forEach(dependency => {
            if (dependency instanceof IndestructiveTrackedResource) dependency.removeDependent(this.tracker);
        });

        this.tracker = undefined as any;
        this.boundedBindGroups = [];
        this.label = undefined;
        this.tracker = undefined as any;
        console.warn(`pipeline layout with nano id ${this.getNanoID()} destroyed`)
    }


    getTracker() {
        return this.tracker;
    }

    getBoundedBindGroups(): GPURawBindgroupLayout[] {
        return this.boundedBindGroups
    }

    getNanoID(): string {
        return this.nanoID;
    }
}