import type {GPUTextureRawEntries} from "./texture.types.ts";
import {getNanoId} from "../../../helpers/globalHelpler.ts";

export class GPURawTexture {
    private nanoID!: string;
    private destroyStatus: boolean = false;
    private gpuTexture!: GPUTexture;
    protected mipmapCount!: number;
    private usage!: number;
    protected depthOrArrayLayers: number = 0;
    protected width!: number;
    protected height!: number;
    private format: GPUTextureFormat;
    private sampleCount: number;
    private label: string;
    private isTextureArray: boolean;
    private sampleType: GPUTextureSampleType

    constructor({
                    device,
                    label,
                    usage,
                    width,
                    height,
                    depthOrArrayLayers,
                    mipmapCount,
                    format,
                    sampleCount
                }: GPUTextureRawEntries) {
        this.width = width;
        this.height = height;
        this.format = format;
        this.depthOrArrayLayers = depthOrArrayLayers;
        this.usage = usage;
        this.sampleCount = sampleCount ?? 1;
        this.mipmapCount = mipmapCount ?? 1;
        this.label = label;
        this.nanoID = getNanoId();
        this.isTextureArray = depthOrArrayLayers > 1;
        this.sampleType = this.getSampleTypeForFormat(this.format);

        this.createTexture(device)
    }

    private getSampleTypeForFormat(format: GPUTextureFormat): GPUTextureSampleType {
        if (format.includes("depth")) return "depth";
        if (format.includes("sint")) return "sint";
        if (format.includes("uint")) return "uint";
        if (format.includes("float")) return "float";
        if (format.includes("unorm")) return "float";
        // fallback for unfilterable formats
        return "unfilterable-float";
    }

    getSampleType(){
        return this.sampleType
    }

    getNanoID(): string {
        return this.nanoID;
    }

    getIsTextureArray() {
        return this.isTextureArray;
    }

    protected createTexture(device: GPUDevice) {
        this.destroyStatus = false;
        this.gpuTexture = device.createTexture({
            format: this.format,
            label: this.label,
            usage: this.usage,
            size: {
                width: this.width,
                height: this.height,
                depthOrArrayLayers: this.depthOrArrayLayers,
            },
            mipLevelCount: this.mipmapCount,
            sampleCount: this.sampleCount,
        })
    }

    getTextureUsageKeys() {
        const usageMap = {
            'COPY_SRC': 0x01,
            'COPY_DST': 0x02,
            'TEXTURE_BINDING': 0x04,
            'STORAGE_BINDING': 0x08,
            'RENDER_ATTACHMENT': 0x10,

        };

        const flags = [];
        for (const key in usageMap) {
            if ((this.usage & (usageMap as any)[key]) !== 0) {
                flags.push(key);
            }
        }
    }

    getSampleCount(){
        return this.sampleCount;
    }

    getTexture() {
        return this.gpuTexture;
    }

    getUsage() {
        return this.usage;
    }

    getMipmapCount() {
        return this.mipmapCount;
    }

    getDepthOrArrayLayers() {
        return this.depthOrArrayLayers;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getFormat(): GPUTextureFormat {
        return this.format;
    }

    isDestroyed(): boolean {
        return this.destroyStatus;
    }

    destroy(): void {
        this.destroyStatus = true;
        this.gpuTexture.destroy();
    }

    getView(descriptor: GPUTextureViewDescriptor) {
        if (this.destroyStatus) throw new Error(`Texture is deleted`);
        return this.gpuTexture.createView(descriptor);
    }
}