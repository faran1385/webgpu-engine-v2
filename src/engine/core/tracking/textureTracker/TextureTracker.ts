import {DestructiveTrackedResource} from "../destructiveTrackedResources.ts";

export default class TextureTracker extends DestructiveTrackedResource {
    private texture: GPUTexture;

    constructor(texture: GPUTexture, isAutoDestroy: boolean) {
        super(isAutoDestroy);

        this.texture = texture;
    }

    getView(descriptor: GPUTextureViewDescriptor) {
        if (this.destroyStatus) throw new Error(`Texture is deleted`);
        return this.texture.createView(descriptor);
    }

    getGPUResource() {
        return this.texture;
    }


    destroy() {
        this.destroyStatus = true;
        this.texture.destroy();
    }
}