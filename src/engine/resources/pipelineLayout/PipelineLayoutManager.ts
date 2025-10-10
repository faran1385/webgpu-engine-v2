import {IndestructiveTrackedResource} from "../../core/tracking/IndestructiveTrackedResources.ts";
import {fnv1aHash} from "../../../helpers/globalHelpler.ts";
import type {ManagerCreateEntries} from "../pipeline/pipeline.types.ts";
import GPURawPipelineLayout from "../pipeline/GPURawPipelineLayout.ts";
import {PipelineLayoutTracker} from "../../core/tracking/pipelineLayoutTracker/pipelineLayoutTracker.ts";
import DeviceManager from "../../core/DeviceManager.ts";

export default class PipelineLayoutManager {
    private static _instance: PipelineLayoutManager;
    private cache: Map<string, {
        wrapperClasses: Map<string, GPURawPipelineLayout>,
        tracker: IndestructiveTrackedResource
    }> = new Map();

    private constructor() {
    }

    public static init() {
        if (!this._instance) {
            this._instance = new PipelineLayoutManager();
        }
        return this._instance
    }


    removeLayout(hash: string, nanoId: string) {
        const map = this.cache.get(hash);
        if (map) {
            map.wrapperClasses.delete(nanoId)
            if (map.wrapperClasses.size <= 0) this.cache.delete(hash)
        }
    }

    createGPUPipelineLayout(T: {
        bindgroupLayouts: ManagerCreateEntries["bindgroupLayouts"],
        layoutLabel?: ManagerCreateEntries["layoutLabel"],
    }) {
        const device = DeviceManager.instance.device
        return device.createPipelineLayout({
            label: T.layoutLabel,
            bindGroupLayouts: T.bindgroupLayouts.map((i) => i.getTracker().getLayout())
        })
    }

    createPipelineLayout(T: {
        bindgroupLayouts: ManagerCreateEntries["bindgroupLayouts"],
        layoutLabel?: ManagerCreateEntries["layoutLabel"],
    }) {
        const hash = fnv1aHash(T.bindgroupLayouts.map(i => i.getNanoID()).join(""))

        const cachedData = this.cache.get(hash);

        if (cachedData && cachedData.wrapperClasses.size > 0) {
            const clone = Array.from(cachedData.wrapperClasses)[0][1].clone();
            cachedData.wrapperClasses.set(clone.getNanoID(), clone);
            this.setPipelineLayoutRelations(T.bindgroupLayouts, clone)

            return clone;
        }
        const gpuPipelineLayout = this.createGPUPipelineLayout(T)
        const tracker = new PipelineLayoutTracker(hash, gpuPipelineLayout);

        const layout = new GPURawPipelineLayout({
            label: T.layoutLabel,
            tracker,
            bindgroupLayouts: T.bindgroupLayouts
        });

        this.setPipelineLayoutRelations(T.bindgroupLayouts, layout)
        this.cache.set(hash, {
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


}