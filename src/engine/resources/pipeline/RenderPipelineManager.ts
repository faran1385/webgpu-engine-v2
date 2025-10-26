import GPURawPipelineLayout from "../pipelineLayout/GPURawPipelineLayout.ts";
import {type ManagerCreateEntries} from "./pipeline.types.ts";
import GPURawRenderPipeline from "./GPURawRenderPipeline.ts";
import {getPipelineDescriptor, getPipelineHash, type pipelineDescriptor} from "../../../helpers/pipelineHelper.ts";
import PipelineLayoutManager from "../pipelineLayout/PipelineLayoutManager.ts";
import {PipelineTracker} from "../../core/tracking/pipelineTracker/pipelineTracker.ts";
import DeviceManager from "../../core/DeviceManager.ts";
import ResourceUpdater from "../../core/resourceUpdater/ResourceUpdater.ts";

export default class RenderPipelineManager {
    private static _instance: RenderPipelineManager;
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
            this._instance = new RenderPipelineManager();
        }
        return this._instance
    }

    removeResource(hash: string, nanoId: string) {
        const map = this.cache.get(hash);
        if (map) {
            map.wrapperClasses.delete(nanoId)
            if (map.wrapperClasses.size <= 0) this.cache.delete(hash)
        }
    }

    getCachedInfoByHash(hash: string) {
        return this.cache.get(hash);
    }

    createOrGetTracker(hash: string, wrapperClass: GPURawRenderPipeline) {
        if (this.cache.has(hash)) {
            const cachedData = this.cache.get(hash)!;
            cachedData.wrapperClasses.set(wrapperClass.getNanoID(), wrapperClass)
            ResourceUpdater.init().removeIndestructiveFromDeleteQueue(wrapperClass);

            return cachedData.tracker;

        }
        const descriptor={
            vertex: wrapperClass.getUpdateTo()?.vertexSetting ?? wrapperClass.getVertexSetting(),
            multiSample: wrapperClass.getUpdateTo()?.multiSample ?? wrapperClass.getMultiSample(),
            fragment: wrapperClass.getUpdateTo()?.fragmentSetting ?? wrapperClass.getFragmentSetting(),
            primitive: wrapperClass.getUpdateTo()?.primitive ?? wrapperClass.getPrimitiveSetting(),
            depthStencil: wrapperClass.getUpdateTo()?.depthStencil ?? wrapperClass.getDepthStencilSetting(),
            pipelineLabel: wrapperClass.getUpdateTo()?.label ?? wrapperClass.getLabel(),
        }
        const newPipeline = this.createGPUPipeline(descriptor, wrapperClass.getLayout())

        const tracker = new PipelineTracker(hash, newPipeline);


        this.cache.set(hash, {
            wrapperClasses: new Map([[wrapperClass.getNanoID(), wrapperClass]]),
            tracker
        })

        return tracker;
    }

    createGPUPipeline(T: pipelineDescriptor, layout: GPURawPipelineLayout) {
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
            const clone = Array.from(cachedData.wrapperClasses)[0][1].clone(layout);
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
            layout,
        })

        this.cache.set(pipelineHash, {
            wrapperClasses: new Map([[pipeline.getNanoID(), pipeline]]),
            tracker
        })
        this.setPipelineRelations(pipeline, layout, T)
        return pipeline;
    }

    private setPipelineRelations(pipeline: GPURawRenderPipeline, layout: GPURawPipelineLayout, T: ManagerCreateEntries) {
        pipeline.addParent(layout)
        layout.addChild(pipeline)

        pipeline.addParent(T.vertex.module)
        T.vertex.module.addChild(pipeline);

        T.fragment ? pipeline.addParent(T.fragment.module) : ""
        T.fragment?.module.addChild(pipeline);
    }
}