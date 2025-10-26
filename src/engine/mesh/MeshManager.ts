import GPURawMesh from "./GPURawMesh.ts";
import RenderPipelineManager from "../resources/pipeline/RenderPipelineManager.ts";
import type {MeshManagerCreateEntries} from "./mesh.types.ts";
import {fnv1aHash} from "../../helpers/globalHelpler.ts";
import BindgroupManager from "../resources/bindgroup/BindgroupManager.ts";

export default class MeshManager {
    private static instance: MeshManager;
    private cache: Map<string, GPURawMesh> = new Map();
    private pipelineManager: RenderPipelineManager;
    private bindgroupManager: BindgroupManager;

    private constructor() {
        this.pipelineManager = RenderPipelineManager.init();
        this.bindgroupManager = BindgroupManager.init();
    }

    public static init() {
        if (!this.instance) {
            this.instance = new MeshManager();
        }

        return this.instance;
    }

    updateHash(oldHash: string, newHash: string, mesh: GPURawMesh) {
        this.cache.delete(oldHash)
        this.cache.set(newHash, mesh);
    }

    create(T: MeshManagerCreateEntries) {
        const meshHash = fnv1aHash(`${T.geometry.getHash()}${T.material.getHash()}`);

        if (this.cache.has(meshHash)) return this.cache.get(meshHash)!;

        const bindgroup = this.bindgroupManager.createBindgroup({
            layoutLabel: T.bindgroupLayoutLabel,
            bindgroupLabel: T.bindgroupLabel,
            resources: T.material.getResources(),
        })

        T.geometry.getVertexBuffers().forEach((vertexBuffer) => {
            vertexBuffer.addChild(bindgroup)
            bindgroup.addParent(vertexBuffer)
        })

        const pipeline = this.pipelineManager.createPipeline({
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
                buffers: T.geometry.getVertexBuffers()
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