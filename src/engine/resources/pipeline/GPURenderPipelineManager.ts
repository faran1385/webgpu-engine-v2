import GPURawPipelineLayout from "./GPURawPipelineLayout.ts";
import {type ManagerCreateEntries} from "./pipeline.types.ts";
import GPURawRenderPipeline from "./GPURawRenderPipeline.ts";
import {getPipelineDescriptor, getPipelineHash} from "../../../helpers/pipelineHelper.ts";
import PipelineLayoutManager from "../pipelineLayout/PipelineLayoutManager.ts";
import {PipelineTracker} from "../../core/tracking/pipelineTracker/pipelineTracker.ts";
import DeviceManager from "../../core/DeviceManager.ts";

export default class GPURenderPipelineManager {
    private static _instance: GPURenderPipelineManager;
    private pipelineLayoutManager: PipelineLayoutManager;
    private cache: Map<string, {
        wrapperClasses: Map<string, GPURawRenderPipeline>,
        tracker: PipelineTracker
    }> = new Map();

    private constructor() {
        this.pipelineLayoutManager = PipelineLayoutManager.init()
    }

    public static init() {
        if (!this._instance) {
            this._instance = new GPURenderPipelineManager();
        }
        return this._instance
    }

    removePipeline(hash: string, nanoId: string) {
        const map = this.cache.get(hash);
        if (map) {
            map.wrapperClasses.delete(nanoId)
            if (map.wrapperClasses.size <= 0) this.cache.delete(hash)
        }
    }


    createGPUPipeline(T: ManagerCreateEntries, layout: GPURawPipelineLayout) {
        const device = DeviceManager.instance.device
        return device.createRenderPipeline(getPipelineDescriptor(T, layout))
    }

    createPipeline(T: ManagerCreateEntries) {
        const layout = this.pipelineLayoutManager.createPipelineLayout({
            bindgroupLayouts: T.bindgroupLayouts,
            layoutLabel: T.layoutLabel
        })

        const pipelineHash = getPipelineHash(T, layout.getTracker().getHash());


        const cachedData = this.cache.get(pipelineHash);

        if (cachedData && cachedData.wrapperClasses.size > 0) {
            const clone = Array.from(cachedData.wrapperClasses)[0][1].clone();
            cachedData.wrapperClasses.set(clone.getNanoID(), clone);


            this.setPipelineRelations(clone, layout, T)
            return clone;
        }

        const gpuPipeline = this.createGPUPipeline(T, layout);

        const tracker = new PipelineTracker(pipelineHash, gpuPipeline);

        const pipeline = new GPURawRenderPipeline({
            vertex: T.vertex,
            fragment: T.fragment,
            pipelineLabel: T.pipelineLabel,
            primitive: T.primitive,
            depthStencil: T.depthStencil,
            tracker,
            multiSample: T.multiSample,
            layout
        })

        this.cache.set(pipelineHash, {
            wrapperClasses: new Map([[pipeline.getNanoID(), pipeline]]),
            tracker
        })
        this.setPipelineRelations(pipeline, layout, T)
        return pipeline;
    }

    private setPipelineRelations(pipeline: GPURawRenderPipeline, layout: GPURawPipelineLayout, T: ManagerCreateEntries) {
        pipeline.getTracker().addDependent(layout.getTracker())
        layout.getTracker().addDependency(pipeline.getTracker())

        pipeline.getTracker().addDependent(T.vertex.module.getTracker())
        T.vertex.module.getTracker().addDependency(pipeline.getTracker());

        T.fragment ? pipeline.getTracker().addDependent(T.fragment.module.getTracker()) : ""
        T.fragment?.module.getTracker().addDependency(pipeline.getTracker());
    }
}