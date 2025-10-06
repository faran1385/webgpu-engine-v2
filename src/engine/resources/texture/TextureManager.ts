import type {TextureMangerCreateTextureArrayOptions, TextureMangerCreateTextureOptions} from "./texture.types.ts";
import {GPUImageTexture} from "./GPUImageTexture.ts";
import GPUBaseTextureArray from "./GPUBaseTextureArray.ts";

export default class TextureManager {
    private cache: Map<string, ImageData> = new Map();
    private static _instance: TextureManager;

    private constructor() {
    }

    public static init() {
        if (!this._instance) {
            this._instance = new TextureManager();
        }
        return this._instance
    }


    async load(url: string) {
        if (this.cache.has(url)) return this.cache.get(url)!;

        const response = await fetch(url);
        const blobData = await response.blob()
        const bitmap = await createImageBitmap(blobData);
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(bitmap, 0, 0);
        const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
        this.cache.set(url, imageData)

        return imageData
    }

    async createTexture(device: GPUDevice, url: string, options: TextureMangerCreateTextureOptions | undefined = undefined) {
        const loadedData = await this.load(url);

        return new GPUImageTexture({
            device,
            label: options?.label ?? "",
            sampleCount: options?.sampleCount ?? 1,
            height: loadedData.height,
            width: loadedData.width,
            format: options?.format ?? "rgba8unorm",
            data: loadedData.data,
            mipmapCount: options?.mipmapCount ?? 1
        })
    }

    async createTextureArray(device: GPUDevice, urls: string[], options: TextureMangerCreateTextureArrayOptions | undefined = undefined) {
        if (urls.length === 0) throw new Error("URLs must not be empty");

        const loadedDataArray: ImageData[] = []

        for (const url of urls) {
            const loadedData = await this.load(url);
            loadedDataArray.push(loadedData);
        }
        let width = loadedDataArray[0].width;
        let height = loadedDataArray[0].height;

        const allHaveSameSize = loadedDataArray.some((t) => t.width === width && t.height === height);

        if (!allHaveSameSize) throw new Error("All images must have the same size");

        return new GPUBaseTextureArray({
            device,
            label: options?.label ?? "",
            height: height,
            width: width,
            depthOrArrayLayers: loadedDataArray.length,
            format: options?.format ?? "rgba8unorm",
            data: loadedDataArray.map(e => e.data),
            mipmapCount: options?.mipmapCount ?? 1
        })
    }
}
