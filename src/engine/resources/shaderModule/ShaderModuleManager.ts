import GPURawShaderModule from "./GPURawShaderModule.ts";
import type {ManagerCreateEntries} from "./shaderModule.types.ts";
import {fnv1aHash} from "../../../helpers/globalHelpler.ts";
import {ShaderModuleTracker} from "../../core/tracking/shaderModuleTracker/shaderModuleTracker.ts";
import DeviceManager from "../../core/DeviceManager.ts";


export default class ShaderModuleManager {
    private cache: Map<string, {
        wrapperClasses: Map<string, GPURawShaderModule>,
        tracker: ShaderModuleTracker
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

    createGPUShaderModule(code: string, label: string | undefined) {
        const device = DeviceManager.instance.device;

        return device.createShaderModule({
            code,
            label
        })
    }

    createShaderModule(T: ManagerCreateEntries) {
        const hash = fnv1aHash(T.code);
        const cachedData = this.cache.get(hash);
        if (cachedData && cachedData.wrapperClasses.size > 0) {
            const clone = Array.from(cachedData.wrapperClasses)[0][1].clone();
            cachedData.wrapperClasses.set(clone.getNanoID(), clone);

            return clone
        }

        const gpuModule = this.createGPUShaderModule(T.code, T.label)

        const tracker = new ShaderModuleTracker(hash, gpuModule);

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