import GPURawGeometry from "./GPURawGeometry.ts";
import type {GeometryEntries} from "./geometry.types.ts";
import {getGeometryHash} from "../../helpers/geometryHelper.ts";

export default class GeometryManager {
    private static instance: GeometryManager;
    private cache: Map<string, GPURawGeometry> = new Map();

    private constructor() {

    }

    public static init() {
        if (!this.instance) {
            this.instance = new GeometryManager();
        }

        return this.instance;
    }

    create(T: {
        buffers: GeometryEntries["buffers"],
        primitive?: GeometryEntries["primitive"],
        indexBuffer?: GeometryEntries["indexBuffer"],
    }) {
        const sortedBuffers = T.buffers.sort((a, b) => {
            return a.getNanoID().localeCompare(b.getNanoID());
        });
        const geometryHash = getGeometryHash({
            ...T,
            buffers: sortedBuffers
        })

        if (this.cache.has(geometryHash)) return this.cache.get(geometryHash)!;

        const material = new GPURawGeometry({
            ...T,
            buffers:sortedBuffers,
            hash: geometryHash,
        })

        this.cache.set(geometryHash, material)

        return material;
    }
}