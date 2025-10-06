import type {GPURawSamplerEntries} from "./sampler.types.ts";
import {getNanoId} from "../../../helpers/globalHelpler.ts";

export default class GPURawSampler {
    private nanoID!: string;

    private gpuSampler: GPUSampler
    private addressModeU: GPUAddressMode;
    private addressModeV: GPUAddressMode;
    private addressModeW: GPUAddressMode;
    private magFilter: GPUFilterMode;
    private minFilter: GPUFilterMode;
    private mipmapFilter: GPUFilterMode;
    private lodMinClamp: number;
    private lodMaxClamp: number;
    private maxAnisotropy: number;
    private compare?: GPUCompareFunction;
    samplerType: GPUSamplerBindingType = "filtering"

    constructor(T: GPURawSamplerEntries) {
        this.gpuSampler = T.device.createSampler(T)
        this.addressModeU = T.addressModeU ?? "clamp-to-edge";
        this.addressModeV = T.addressModeV ?? "clamp-to-edge";
        this.addressModeW = T.addressModeW ?? "clamp-to-edge";
        this.magFilter = T.magFilter ?? "nearest";
        this.minFilter = T.minFilter ?? "nearest";
        this.mipmapFilter = T.mipmapFilter ?? "nearest";
        this.lodMinClamp = T.lodMinClamp ?? 0;
        this.lodMaxClamp = T.lodMaxClamp ?? 32;
        this.maxAnisotropy = T.maxAnisotropy ?? 1;
        this.compare = T.compare;
        this.nanoID = getNanoId();
    }

    getNanoID(): string {
        return this.nanoID;
    }

    getCompareFunction() {
        return this.compare
    }

    getMaxAnisotropy() {
        return this.maxAnisotropy
    }

    getLodMaxClamp() {
        return this.lodMaxClamp
    }

    getLodMinClamp() {
        return this.lodMinClamp
    }

    getMipmapFilter() {
        return this.mipmapFilter
    }

    getMinFilter() {
        return this.minFilter
    }

    getMagFilter() {
        return this.magFilter
    }

    getAddressModeW() {
        return this.addressModeW
    }

    getAddressModeU() {
        return this.addressModeU
    }

    getAddressModeV() {
        return this.addressModeV
    }


    getSampler() {
        return this.gpuSampler;
    }
}



