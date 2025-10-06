import type {GeometryEntries} from "./geometry.types.ts";
import {getNanoId} from "../../helpers/globalHelpler.ts";

export default class GPURawGeometry {
    private nanoID!: string;
    private buffers: GeometryEntries["buffers"]
    private primitive: GeometryEntries["primitive"]
    private hash: string;

    constructor(T: GeometryEntries) {
        this.buffers = T.buffers;
        this.primitive = T.primitive;
        this.nanoID = getNanoId();
        this.hash = T.hash;
    }

    getBuffers() {
        return this.buffers;
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