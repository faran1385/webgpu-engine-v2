import {getNanoId} from "../../helpers/globalHelpler.ts";
import type {MeshEntries} from "./mesh.types.ts";
import type GPURawGeometry from "../geometry/GPURawGeometry.ts";
import type GPURawMaterial from "../material/GPURawMaterial.ts";
import type GPURawRenderPipeline from "../resources/pipeline/GPURawRenderPipeline.ts";
import type GPURawBindgroup from "../resources/bindgroup/GPURawBindgroup.ts";

export default class GPURawMesh {
    private nanoID!: string;
    private hash: string;
    private geometry: GPURawGeometry;
    private material: GPURawMaterial;
    private pipeline!: GPURawRenderPipeline;
    private bindgroup!: GPURawBindgroup;


    constructor(T: MeshEntries) {
        this.nanoID = getNanoId();
        this.hash = T.hash;
        this.geometry = T.geometry;
        this.material = T.material;
        this.bindgroup=T.bindgroup;
        this.pipeline = T.pipeline;
    }

    getPipeline(){
        return this.pipeline;
    }

    getBindgroup(){
        return this.bindgroup;
    }

    getGeometry(): GPURawGeometry {
        return this.geometry;
    }

    getMaterial(): GPURawMaterial {
        return this.material;
    }

    getNanoID(): string {
        return this.nanoID;
    }

    getHash() {
        return this.hash
    }

}