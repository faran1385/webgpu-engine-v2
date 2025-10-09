import {getNanoId} from "../../../helpers/globalHelpler.ts";
import type {GPURawPipelineLayoutEntries} from "./pipeline.types.ts";
import type GPURawBindgroupLayout from "../bindgroup/GPURawBindgroupLayout.ts";
import DeviceManager from "../../core/DeviceManager.ts";
import  {IndestructiveTrackedResource} from "../../core/tracking/IndestructiveTrackedResources.ts";
import GPURenderPipelineManager from "./GPURenderPipelineManager.ts";
import {BaseIndestructiveResourceNeeds} from "../BaseResourceNeeds.ts";

export default class GPURawPipelineLayout extends BaseIndestructiveResourceNeeds{
    private boundedBindGroups: GPURawBindgroupLayout[]
    protected nanoID!: string;
    private pipelineLayout!: GPUPipelineLayout;
    private label?: string
    protected tracker: IndestructiveTrackedResource

    constructor(T: GPURawPipelineLayoutEntries) {
        super();
        this.nanoID = getNanoId();
        this.boundedBindGroups = T.bindgroupLayouts
        this.label = T.label;
        this.tracker = T.tracker;
        if (T.isCopy) {
            this.pipelineLayout = T.pipelineLayout;
        } else {
            this.createPipelineLayout()
        }
    }

    clone() {
        return new GPURawPipelineLayout({
            isCopy: true,
            pipelineLayout: this.pipelineLayout,
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
        this.pipelineLayout = undefined as any;
        this.label = undefined;
        this.tracker = undefined as any;
    }

    private createPipelineLayout() {
        const device = DeviceManager.instance.device

        this.pipelineLayout = device.createPipelineLayout({
            label: this.label,
            bindGroupLayouts: this.boundedBindGroups.map((i) => i.getLayout())
        })
    }

    getPipelineLayout() {
        return this.pipelineLayout;
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