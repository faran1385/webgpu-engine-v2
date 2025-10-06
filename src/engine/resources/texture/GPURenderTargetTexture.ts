import GPUBaseTexture from "./GPUBaseTexture.ts";
import type {GPURenderTargetTextureEntries} from "./texture.types.ts";

export default class GPURenderTargetTexture extends GPUBaseTexture {
    constructor(T: GPURenderTargetTextureEntries) {
        super({
            ...T,
            sampleCount: T.sampleCount ?? 1,
            mipmapCount: 1,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST
        });
    }
}