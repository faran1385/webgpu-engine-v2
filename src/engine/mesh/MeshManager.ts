import GPURawMesh from "./GPURawMesh.ts";
import GPURenderPipelineManager from "../resources/pipeline/GPURenderPipelineManager.ts";
import type {MeshManagerCreateEntries} from "./mesh.types.ts";
import {fnv1aHash} from "../../helpers/globalHelpler.ts";
import GPUBindgroupManager from "../resources/bindgroup/GPUBindgroupManager.ts";

export default class MeshManager {
    private static instance: MeshManager;
    private cache: Map<string, GPURawMesh> = new Map();
    private pipelineManager: GPURenderPipelineManager;
    private bindgroupManager: GPUBindgroupManager;

    private constructor() {
        this.pipelineManager = GPURenderPipelineManager.init();
        this.bindgroupManager = GPUBindgroupManager.init();
    }

    public static init() {
        if (!this.instance) {
            this.instance = new MeshManager();
        }

        return this.instance;
    }

    create(device: GPUDevice, T: MeshManagerCreateEntries) {
        const meshHash = fnv1aHash(`${T.geometry.getHash()}${T.material.getHash()}`);

        if (this.cache.has(meshHash)) return this.cache.get(meshHash)!;

        const bindgroup = this.bindgroupManager.create(device, {
            layoutLabel: T.bindgroupLayoutLabel,
            bindgroupLabel: T.bindgroupLabel,
            resources: T.material.getResources(),
        })

        const pipeline = this.pipelineManager.create(device, {
            layoutLabel: T.pipelineLayoutLabel,
            pipelineLabel: T.pipelineLabel,
            primitive: {
                ...T.material.getPrimitive(),
                ...T.geometry.getPrimitive()
            },
            depthStencil: T.material.getDepthStencil(),
            multiSample: T.material.getMultiSample(),
            vertex: {
                ...T.material.getVertex(),
                buffers: T.geometry.getBuffers()
            },
            fragment: T.material.getFragment() ? {
                ...T.material.getFragment()!,
            } : undefined,
            bindgroupLayouts: [bindgroup.getLayout()]
        })

        const mesh = new GPURawMesh({
            pipeline,
            material: T.material,
            geometry: T.geometry,
            bindgroup,
            hash: meshHash,
        })

        this.cache.set(meshHash, mesh)

        return mesh
    }
}