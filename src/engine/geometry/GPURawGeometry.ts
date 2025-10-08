import type {GeometryEntries} from "./geometry.types.ts";
import {getNanoId} from "../../helpers/globalHelpler.ts";
import type GPUIndexBuffer from "../resources/buffer/GPUIndexBuffer.ts";

export default class GPURawGeometry {
    private nanoID!: string;
    private vertexBuffers: GeometryEntries["buffers"]
    private primitive: GeometryEntries["primitive"];
    private indexBuffer?: GPUIndexBuffer
    private hash: string;

    constructor(T: GeometryEntries) {
        this.vertexBuffers = T.buffers;
        this.primitive = T.primitive;
        this.nanoID = getNanoId();
        this.hash = T.hash;
        this.indexBuffer = T.indexBuffer;
    }

    getIndexBuffer() {
        return this.indexBuffer;
    }

    getVertexBuffers() {
        return this.vertexBuffers;
    }

    getNanoID(): string {
        return this.nanoID;
    }

    getHash() {
        return this.hash
    }

    getPrimitive() {
        return this.primitive;
    }
}