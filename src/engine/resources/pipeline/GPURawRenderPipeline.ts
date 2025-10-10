import {getNanoId} from "../../../helpers/globalHelpler.ts";
import {type GPURawPipelineEntries} from "./pipeline.types.ts";
import type GPURawPipelineLayout from "./GPURawPipelineLayout.ts";
import {IndestructiveTrackedResource} from "../../core/tracking/IndestructiveTrackedResources.ts";
import GPURenderPipelineManager from "./GPURenderPipelineManager.ts";
import {BaseIndestructiveResourceNeeds} from "../BaseResourceNeeds.ts";
import type {PipelineTracker} from "../../core/tracking/pipelineTracker/pipelineTracker.ts";

export default class GPURawRenderPipeline extends BaseIndestructiveResourceNeeds{
    protected nanoID!: string;
    private label?: string;
    protected tracker: PipelineTracker;
    vertexSetting: GPURawPipelineEntries["vertex"]

    fragmentSetting: GPURawPipelineEntries["fragment"];

    private layout: GPURawPipelineLayout

    primitive: GPURawPipelineEntries["primitive"]
    multiSample: GPURawPipelineEntries["multiSample"]

    depthStencil?: GPURawPipelineEntries["depthStencil"]

    constructor(T: GPURawPipelineEntries) {
        super();
        this.layout = T.layout;
        this.nanoID = getNanoId();
        this.label=T.pipelineLabel;
        this.tracker = T.tracker;
        this.vertexSetting=T.vertex;
        this.fragmentSetting=T.fragment;
        this.layout=T.layout;
        this.primitive=T.primitive;
        this.multiSample=T.multiSample;
        this.depthStencil=T.depthStencil;
    }

    getTracker() {
        return this.tracker;
    }

    clone() {
        return new GPURawRenderPipeline({
            vertex: this.vertexSetting,
            fragment: this.fragmentSetting,
            multiSample: this.multiSample,
            pipelineLabel: this.label,
            tracker: this.tracker,
            primitive: this.primitive,
            depthStencil: this.depthStencil,
            layout: this.layout
        })
    }

    destroyInternal() {
        const manager = GPURenderPipelineManager.init();
        manager.removePipeline(this.tracker.getHash(), this.nanoID)

        this.tracker.getDependents().forEach(dependent => {
            dependent.removeDependency(this.tracker);
        });

        this.tracker.getDependencies().forEach(dependency => {
            if (dependency instanceof IndestructiveTrackedResource) dependency.removeDependent(this.tracker);
        });

        this.label =undefined;
        this.tracker =undefined as any;
        this.vertexSetting =undefined as any;
        this.fragmentSetting =undefined;
        this.primitive =undefined;
        this.multiSample =undefined;
        this.depthStencil =undefined;
        this.layout =undefined as any;
        console.warn(`pipeline with nano id ${this.getNanoID()} destroyed`)
    }


    getMultiSample() {
        return this.multiSample
    }


    getLayout() {
        return this.layout
    }

    getFragmentSetting() {
        return this.fragmentSetting
    }

    getVertexSetting() {
        return this.vertexSetting
    }

    getPrimitiveSetting() {
        return this.primitive
    }

    getDepthStencilSetting() {
        return this.depthStencil;
    }

    getNanoID(): string {
        return this.nanoID;
    }
}