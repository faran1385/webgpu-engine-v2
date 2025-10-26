import {getNanoId} from "../../../helpers/globalHelpler.ts";
import {type GPURawPipelineEntries, type PipelineGraph, type RenderPipelineParent} from "./pipeline.types.ts";
import type GPURawPipelineLayout from "../pipelineLayout/GPURawPipelineLayout.ts";
import {BaseIndestructiveResourceNeeds} from "../BaseResourceNeeds.ts";
import type {PipelineTracker} from "../../core/tracking/pipelineTracker/pipelineTracker.ts";
import RenderPipelineManager from "./RenderPipelineManager.ts";
import {getPipelineHash} from "../../../helpers/pipelineHelper.ts";
import ResourceUpdater from "../../core/resourceUpdater/ResourceUpdater.ts";


export default class GPURawRenderPipeline extends BaseIndestructiveResourceNeeds {
    protected nanoID!: string;
    protected tracker: PipelineTracker;
    private label?: string;
    private vertexSetting: GPURawPipelineEntries["vertex"]

    private fragmentSetting: GPURawPipelineEntries["fragment"];

    private layout: GPURawPipelineLayout

    private primitive: GPURawPipelineEntries["primitive"]
    private multiSample: GPURawPipelineEntries["multiSample"]

    private depthStencil?: GPURawPipelineEntries["depthStencil"]
    private manager: RenderPipelineManager;
    private graph: PipelineGraph = {
        parents: new Set<RenderPipelineParent>(),
        children: null
    }
    needsUpdate: boolean = false;
    isBuilt: boolean = true;

    private updateTo: null | {
        label?: string;
        vertexSetting: GPURawPipelineEntries["vertex"]
        fragmentSetting: GPURawPipelineEntries["fragment"];
        primitive: GPURawPipelineEntries["primitive"]
        multiSample: GPURawPipelineEntries["multiSample"]
        depthStencil?: GPURawPipelineEntries["depthStencil"]
    } = null

    constructor(T: GPURawPipelineEntries) {
        super();
        this.manager = RenderPipelineManager.init();
        this.layout = T.layout;
        this.nanoID = getNanoId();
        this.label = T.pipelineLabel;
        this.tracker = T.tracker;
        this.vertexSetting = T.vertex;
        this.fragmentSetting = T.fragment;
        this.layout = T.layout;
        this.primitive = T.primitive;
        this.multiSample = T.multiSample;
        this.depthStencil = T.depthStencil;
    }

    private applyUpdates() {
        this.primitive = this.updateTo?.primitive! ?? this.primitive;
        this.fragmentSetting = this.updateTo?.fragmentSetting! ?? this.fragmentSetting;
        this.vertexSetting = this.updateTo?.vertexSetting! ?? this.vertexSetting;
        this.depthStencil = this.updateTo?.depthStencil! ?? this.depthStencil;
        this.multiSample = this.updateTo?.multiSample! ?? this.multiSample;
        this.label = this.updateTo?.label;

        this.updateTo = null;
        this.isBuilt = true;
        this.needsUpdate = false;
    }

    rebuild() {
        const hash = getPipelineHash({
            fragment: this.updateTo?.fragmentSetting ?? this.fragmentSetting,
            multiSample: this.updateTo?.multiSample ?? this.multiSample,
            primitive: this.updateTo?.primitive ?? this.primitive,
            depthStencil: this.updateTo?.depthStencil ?? this.depthStencil,
            vertex: this.updateTo?.vertexSetting ?? this.vertexSetting,
        }, this.layout.getTracker().getHash());
        ResourceUpdater.init().addToIndestructiveDeleteQueue(this,this.getTracker().getHash());
        this.manager.removeResource(this.tracker.getHash(), this.nanoID)
        this.tracker = this.manager.createOrGetTracker(hash, this);
        this.applyUpdates()
    }

    getManager() {
        return this.manager
    }

    getUpdateTo() {
        return this.updateTo;
    }

    getLabel() {
        return this.label;
    }

    getGraph() {
        return this.graph;
    }

    addParent(parent: RenderPipelineParent) {
        this.graph.parents.add(parent);
    }

    getTracker() {
        return this.tracker;
    }

    clone(layout: GPURawPipelineLayout) {
        return new GPURawRenderPipeline({
            vertex: this.vertexSetting,
            fragment: this.fragmentSetting,
            multiSample: this.multiSample,
            pipelineLabel: this.label,
            tracker: this.tracker,
            primitive: this.primitive,
            depthStencil: this.depthStencil,
            layout,
        })
    }

    destroyInternal() {
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