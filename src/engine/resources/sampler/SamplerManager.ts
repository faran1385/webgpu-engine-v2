import GPURawSampler from "./GPURawSampler.ts";
import DeviceManager from "../../core/DeviceManager.ts";
import {fnv1aHash} from "../../../helpers/globalHelpler.ts";
import {SamplerTracker} from "../../core/tracking/sampler/SamplerTracker.ts";
import ResourceUpdater from "../../core/resourceUpdater/ResourceUpdater.ts";

export default class SamplerManager {
    private cache: Map<string, {
        wrapperClasses: Map<string, GPURawSampler>,
        tracker: SamplerTracker
    }> = new Map();
    private static _instance: SamplerManager;

    private constructor() {
    }

    public static init() {
        if (!this._instance) {
            this._instance = new SamplerManager();
        }
        return this._instance
    }

    removeResource(hash: string, nanoId: string) {
        const map = this.cache.get(hash);
        if (map) {
            map.wrapperClasses.delete(nanoId)
            if (map.wrapperClasses.size <= 0) this.cache.delete(hash)
        }
    }


    public compileHash(descriptor: GPUSamplerDescriptor) {
        let string = "";

        for (const key in descriptor) {
            string += `${key}:${(descriptor as any)[key]};`;
        }

        return fnv1aHash(string)
    }


    createGPUSampler(descriptor: GPUSamplerDescriptor) {
        const device = DeviceManager.instance.device
        return device.createSampler({
            ...descriptor,
        });
    }

    createOrGetTracker(hash: string, wrapperClass: GPURawSampler) {

        if (this.cache.has(hash)) {
            const cachedData = this.cache.get(hash)!;
            cachedData.wrapperClasses.set(wrapperClass.getNanoID(), wrapperClass)
            ResourceUpdater.init().removeIndestructiveFromDeleteQueue(wrapperClass);

            return cachedData.tracker;
        }

        const data = {
            label: wrapperClass.getUpdateTo()?.label ?? wrapperClass.getLabel(),
            addressModeW: wrapperClass.getUpdateTo()?.addressModeW ?? wrapperClass.getAddressModeW(),
            addressModeU: wrapperClass.getUpdateTo()?.addressModeU ?? wrapperClass.getAddressModeU(),
            addressModeV: wrapperClass.getUpdateTo()?.addressModeV ?? wrapperClass.getAddressModeV(),
            maxAnisotropy: wrapperClass.getUpdateTo()?.maxAnisotropy ?? wrapperClass.getMaxAnisotropy(),
            compare: wrapperClass.getUpdateTo()?.compare ?? wrapperClass.getCompareFunction(),
            lodMinClamp: wrapperClass.getUpdateTo()?.lodMinClamp ?? wrapperClass.getLodMinClamp(),
            lodMaxClamp: wrapperClass.getUpdateTo()?.lodMaxClamp ?? wrapperClass.getLodMaxClamp(),
            minFilter: wrapperClass.getUpdateTo()?.minFilter ?? wrapperClass.getMinFilter(),
            magFilter: wrapperClass.getUpdateTo()?.magFilter ?? wrapperClass.getMagFilter(),
            mipmapFilter: wrapperClass.getUpdateTo()?.mipmapFilter ?? wrapperClass.getMipmapFilter(),
        }

        const newSampler = this.createGPUSampler(data)

        const tracker = new SamplerTracker(hash, newSampler);

        this.cache.set(hash, {
            wrapperClasses: new Map([[wrapperClass.getNanoID(), wrapperClass]]),
            tracker
        })

        return tracker;
    }

    createSampler(options: GPUSamplerDescriptor | undefined = undefined) {

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
            compare: options?.compare,
            label: options?.label
        }
        const hash = this.compileHash(descriptor);

        const cachedData = this.cache.get(hash);

        if (cachedData && cachedData.wrapperClasses.size > 0) {
            const clone = Array.from(cachedData.wrapperClasses)[0][1].clone();
            cachedData.wrapperClasses.set(clone.getNanoID(), clone);

            return clone;
        }

        const gpuSampler = this.createGPUSampler(descriptor);

        const tracker = new SamplerTracker(hash, gpuSampler);

        const sampler = new GPURawSampler({
            ...descriptor,
            tracker,
        })


        this.cache.set(hash, {
            wrapperClasses: new Map([[sampler.getNanoID(), sampler]]),
            tracker
        });

        return sampler;
    }

    getCachedInfoByHash(hash: string) {
        return this.cache.get(hash);
    }

}
