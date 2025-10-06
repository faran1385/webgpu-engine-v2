import GPURawPipelineLayout from "./GPURawPipelineLayout.ts";
import {type ManagerCreateEntries} from "./pipeline.types.ts";
import GPURawRenderPipeline from "./GPURawRenderPipeline.ts";
import {getPipelineHash} from "../../../helpers/pipelineHelper.ts";

export default class GPURenderPipelineManager {
    private static _instance: GPURenderPipelineManager;
    private pipelineLayoutCache: Map<string, GPURawPipelineLayout> = new Map();
    private pipelineCache: Map<string, GPURawRenderPipeline> = new Map();

    private constructor() {
    }

    public static init() {
        if (!this._instance) {
            this._instance = new GPURenderPipelineManager();
        }
        return this._instance
    }

    removePipeline(hash: string) {
        this.pipelineCache.delete(hash);
    }

    addPipeline(pipeline: GPURawRenderPipeline) {
        this.pipelineCache.set(pipeline.getHash(), pipeline);
    }

    create(device: GPUDevice, T: ManagerCreateEntries) {
        let layout: GPURawPipelineLayout;
        const layoutHash = T.bindgroupLayouts.map(i => i.getNanoID()).join("")
        if (this.pipelineLayoutCache.has(layoutHash)) {
            layout = this.pipelineLayoutCache.get(layoutHash)!;
        } else {
            layout = new GPURawPipelineLayout(device, {
                label: T.layoutLabel,
                bindgroupLayouts: T.bindgroupLayouts,
                hash: layoutHash
            })
            this.pipelineLayoutCache.set(layoutHash, layout);
        }
        const pipelineHash = getPipelineHash(T, layoutHash);
        if (this.pipelineCache.has(pipelineHash)) return this.pipelineCache.get(pipelineHash)!;

        const pipeline = new GPURawRenderPipeline(device, {
            vertex: T.vertex,
            fragment: T.fragment,
            pipelineLabel: T.pipelineLabel,
            primitive: T.primitive,
            depthStencil: T.depthStencil,
            hash: pipelineHash,
            multiSample: T.multiSample,
            layout
        })

        this.addPipeline(pipeline)
        return pipeline;
    }
}