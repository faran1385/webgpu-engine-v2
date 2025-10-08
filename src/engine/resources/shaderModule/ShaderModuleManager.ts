import GPURawShaderModule from "./GPURawShaderModule.ts";
import type {ManagerCreateEntries} from "./shaderModule.types.ts";
import {TrackedResource} from "../../core/tracking/TrackedResources.ts";
import {fnv1aHash} from "../../../helpers/globalHelpler.ts";


export default class ShaderModuleManager {
    private cache: Map<string, {
        wrapperClasses: Map<string, GPURawShaderModule>,
        tracker: TrackedResource
    }> = new Map();

    private static instance: ShaderModuleManager;

    private constructor() {
    }

    public static init() {
        if (!this.instance) {
            this.instance = new ShaderModuleManager();
        }

        return this.instance;
    }

    removeHash(hash: string, nanoId: string) {
        const map = this.cache.get(hash);
        if (map) {
            map.wrapperClasses.delete(nanoId)
            if (map.wrapperClasses.size <= 0) this.cache.delete(hash)
        }
    }

    createShaderModule(T: ManagerCreateEntries) {
        const hash = fnv1aHash(T.code);
        const cachedData = this.cache.get(hash);
        if (cachedData && cachedData.wrapperClasses.size > 0) {
            const clone = Array.from(cachedData.wrapperClasses)[0][1].clone();
            cachedData.wrapperClasses.set(clone.getNanoID(), clone);

            return clone
        }

        const tracker = new TrackedResource(hash);

        const module = new GPURawShaderModule({
            ...T,
            tracker
        });

        this.cache.set(hash, {
            wrapperClasses: new Map([[module.getNanoID(), module]]),
            tracker
        });

        return module;
    }
}