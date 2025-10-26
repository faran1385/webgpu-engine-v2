import type {GPUTextureRawEntries, TextureGraph} from "./texture.types.ts";
import {getNanoId} from "../../../helpers/globalHelpler.ts";
import DeviceManager from "../../core/DeviceManager.ts";
import {BaseDestructiveResourceNeeds} from "../BaseResourceNeeds.ts";
import type GPURawBindgroup from "../bindgroup/GPURawBindgroup.ts";
import TextureTracker from "../../core/tracking/textureTracker/TextureTracker.ts";

export type TextureChild = GPURawBindgroup;

export class GPURawTexture extends BaseDestructiveResourceNeeds {
    protected nanoID!: string;

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
    protected tracker: TextureTracker;
    private graph: TextureGraph = {
        parents: null,
        children: new Set()
    }
    needsUpdate = false;
    isBuilt: boolean = true;

    rebuild() {

    }


    constructor({
                    label,
                    usage,
                    width,
                    height,
                    depthOrArrayLayers,
                    mipmapCount,
                    format,
                    sampleCount,
                    isAutoDestroy
                }: GPUTextureRawEntries) {
        super();
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
        this.tracker = new TextureTracker(this.createTexture(), isAutoDestroy ?? true);
    }

    getGraph() {
        return this.graph;
    }

    getTracker(): TextureTracker {
        return this.tracker;
    }

    addChild(child: TextureChild) {
        this.graph.children.add(child);
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

    getSampleType() {
        return this.sampleType
    }

    getNanoID(): string {
        return this.nanoID;
    }

    getIsTextureArray() {
        return this.isTextureArray;
    }

    protected createTexture() {
        const device = DeviceManager.instance.device

        return device.createTexture({
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

    getSampleCount() {
        return this.sampleCount;
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

    destroy(): void {
        this.graph.children.forEach(child => {
            child.removeParent(this);
        });
        console.warn(`texture with nano id ${this.getNanoID()} destroyed`)
    }

}