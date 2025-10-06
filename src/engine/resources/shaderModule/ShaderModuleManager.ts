import GPURawShaderModule from "./GPURawShaderModule.ts";
import type {shaderModuleEntries} from "./shaderModule.types.ts";

export default class ShaderModuleManager {
    private cache: Map<string, GPURawShaderModule> = new Map();

    private static instance: ShaderModuleManager;

    private constructor() {
    }

    public static init() {
        if (!this.instance) {
            this.instance = new ShaderModuleManager();
        }

        return this.instance;
    }

    createShaderModule(device: GPUDevice, T: shaderModuleEntries) {
        if (this.cache.has(T.code)) return this.cache.get(T.code)!;

        const module = new GPURawShaderModule(device, T);

        this.cache.set(T.code, module)

        return module;
    }
}