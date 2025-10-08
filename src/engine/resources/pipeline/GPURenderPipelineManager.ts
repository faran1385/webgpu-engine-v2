import GPURawPipelineLayout from "./GPURawPipelineLayout.ts";
import {type ManagerCreateEntries} from "./pipeline.types.ts";
import GPURawRenderPipeline from "./GPURawRenderPipeline.ts";
import {getPipelineHash} from "../../../helpers/pipelineHelper.ts";
import {TrackedResource} from "../../core/tracking/TrackedResources.ts";
import {fnv1aHash} from "../../../helpers/globalHelpler.ts";

export default class GPURenderPipelineManager {
    private static _instance: GPURenderPipelineManager;
    private pipelineLayoutCache: Map<string, {
        wrapperClasses: Map<string, GPURawPipelineLayout>,
        tracker: TrackedResource
    }> = new Map();
    private pipelineCache: Map<string, {
        wrapperClasses: Map<string, GPURawRenderPipeline>,
        tracker: TrackedResource
    }> = new Map();

    private constructor() {
    }

    public static init() {
        if (!this._instance) {
            this._instance = new GPURenderPipelineManager();
        }
        return this._instance
    }

    removePipeline(hash: string, nanoId: string) {
        this.removeFromCache(hash, nanoId, "pipelineCache")
    }

    removeLayout(hash: string, nanoId: string) {
        this.removeFromCache(hash, nanoId, "pipelineLayoutCache")
    }

    private removeFromCache(hash: string, nanoId: string, cacheName: "pipelineCache" | "pipelineLayoutCache") {
        const map = this[cacheName].get(hash);
        if (map) {
            map.wrapperClasses.delete(nanoId)
            if (map.wrapperClasses.size <= 0) this[cacheName].delete(hash)
        }
    }

    createPipelineLayout(T: {
        bindgroupLayouts: ManagerCreateEntries["bindgroupLayouts"],
        layoutLabel?: ManagerCreateEntries["layoutLabel"],
    }) {
        const hash = fnv1aHash(T.bindgroupLayouts.map(i => i.getNanoID()).join(""))

        const cachedData = this.pipelineLayoutCache.get(hash);

        if (cachedData && cachedData.wrapperClasses.size > 0) {
            const clone = Array.from(cachedData.wrapperClasses)[0][1].clone();
            cachedData.wrapperClasses.set(clone.getNanoID(), clone);
            this.setPipelineLayoutRelations(T.bindgroupLayouts, clone)

            return clone;
        }

        const tracker = new TrackedResource(hash);

        const layout = new GPURawPipelineLayout({
            isCopy: false,
            label: T.layoutLabel,
            tracker,
            bindgroupLayouts: T.bindgroupLayouts
        });

        this.setPipelineLayoutRelations(T.bindgroupLayouts, layout)
        this.pipelineLayoutCache.set(hash, {
            wrapperClasses: new Map([[layout.getNanoID(), layout]]),
            tracker
        });
        return layout;
    }

    private setPipelineLayoutRelations(bindgroupLayouts: ManagerCreateEntries["bindgroupLayouts"], layout: GPURawPipelineLayout) {
        bindgroupLayouts.forEach((i) => {
            i.getTracker().addDependency(layout.getTracker())
            layout.getTracker().addDependent(i.getTracker())
        })
    }

    createPipeline(T: ManagerCreateEntries) {
        const layout = this.createPipelineLayout({
            bindgroupLayouts: T.bindgroupLayouts,
            layoutLabel: T.layoutLabel
        });

        const pipelineHash = getPipelineHash(T, layout.getTracker().getHash());


        const cachedData = this.pipelineCache.get(pipelineHash);

        if (cachedData && cachedData.wrapperClasses.size > 0) {
            const clone = Array.from(cachedData.wrapperClasses)[0][1].clone();
            cachedData.wrapperClasses.set(clone.getNanoID(), clone);


            this.setPipelineRelations(clone, layout, T)
            return clone;
        }

        const tracker = new TrackedResource(pipelineHash);

        const pipeline = new GPURawRenderPipeline({
            vertex: T.vertex,
            fragment: T.fragment,
            pipelineLabel: T.pipelineLabel,
            primitive: T.primitive,
            depthStencil: T.depthStencil,
            tracker,
            isCopy: false,
            multiSample: T.multiSample,
            layout
        })

        this.pipelineCache.set(pipelineHash, {
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