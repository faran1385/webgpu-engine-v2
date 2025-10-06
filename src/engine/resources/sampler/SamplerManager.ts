import GPURawSampler from "./GPURawSampler.ts";

export default class SamplerManager {
    private cache: Map<string, GPURawSampler> = new Map();
    private static _instance: SamplerManager;

    private constructor() {
    }

    public static init() {
        if (!this._instance) {
            this._instance = new SamplerManager();
        }
        return this._instance
    }


    private generateKey(descriptor: GPUSamplerDescriptor) {
        let string = "";

        for (const key in descriptor) {
            string += `${key}:${(descriptor as any)[key]};`;
        }

        return string
    }


    createSampler(device: GPUDevice, options: GPUSamplerDescriptor | undefined = undefined) {

        const descriptor = {
            addressModeU: options?.addressModeU ?? "clamp-to-edge",
            addressModeV: options?.addressModeV ?? "clamp-to-edge",
            addressModeW: options?.addressModeW ?? "clamp-to-edge",
            magFilter: options?.magFilter ?? "nearest",
            minFilter: options?.minFilter ?? "nearest",
            mipmapFilter: options?.mipmapFilter ?? "nearest",
            lodMinClamp: options?.lodMinClamp ?? 0,
            lodMaxClamp: options?.lodMaxClamp ?? 32,
            maxAnisotropy: options?.maxAnisotropy ?? 1,
            compare: options?.compare ?? "never",
        }

        const key=this.generateKey(descriptor);

        if (this.cache.has(key)) return this.cache.get(key)!;
        const sampler = new GPURawSampler({
            device,
            label: options?.label ?? ""
        });
        this.cache.set(key, sampler)

        return sampler
    }
}
