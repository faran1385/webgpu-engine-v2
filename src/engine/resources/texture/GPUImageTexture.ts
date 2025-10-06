import GPUBaseTexture from "./GPUBaseTexture.ts";
import type {GPUImageTextureEntries} from "./texture.types.ts";

export class GPUImageTexture extends GPUBaseTexture {
    constructor(T: GPUImageTextureEntries) {
        super({
            ...T,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST
        });

        this.fillWithData(T.device, T.data)
        if (T.mipmapCount ?? 1 > 1) this.generateMipmaps(T.device)
    }

    fillWithData(device: GPUDevice, data: Uint8ClampedArray) {
        const texture = this.getTexture();


        device.queue.writeTexture(
            {
                texture: texture,
                origin: [0, 0, 0]
            },
            data,
            {
                bytesPerRow: this.getWidth() * 4,
                rowsPerImage: this.getHeight()
            },
            {width: this.getWidth(), height: this.getHeight(), depthOrArrayLayers: 1}
        );
    }
}