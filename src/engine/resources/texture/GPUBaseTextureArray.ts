import {GPURawTexture} from "./GPURawTexture.ts";
import type {GPUBaseTextureArrayEntries} from "./texture.types.ts";

export default class GPUBaseTextureArray extends GPURawTexture {
    private viewDimension: GPUTextureViewDimension = "2d-array";

    constructor(T: GPUBaseTextureArrayEntries) {
        super({
            ...T,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
            sampleCount: 1
        });
        this.fillWithData(T.device, T.data)
        if (T.mipmapCount ?? 1 > 1) this.generateMipmaps(T.device)
    }

    getViewDimension() {
        return this.viewDimension;
    }

    fillWithData(device: GPUDevice, dataArray: Uint8ClampedArray[]) {
        const texture = this.getTexture();


        for (let i = 0; i < dataArray.length; i++) {
            device.queue.writeTexture(
                {
                    texture: texture,
                    origin: [0, 0, i]
                },
                dataArray[i],
                {
                    bytesPerRow: this.getWidth() * 4,
                    rowsPerImage: this.getHeight()
                },
                {width: this.getWidth(), height: this.getHeight(), depthOrArrayLayers: 1}
            );
        }
    }

    resize(device: GPUDevice, width: number, height: number, depthOrArrayLayers: number) {
        this.width = width;
        this.height = height;
        this.depthOrArrayLayers = depthOrArrayLayers;
        this.createTexture(device);
    }

    /**
     * Generates all mipmap levels for every layer in a GPUTexture array.
     * @param {GPUDevice} device The WebGPU device.
     * @param {GPUTexture} texture The texture array to generate mipmaps for.
     * @returns {void}
     */
    generateMipmaps(device: GPUDevice) {

        const texture = this.getTexture();
        const mipLevelCount = texture.mipLevelCount;
        const arrayLayerCount = texture.depthOrArrayLayers;
        const format = texture.format;

        // --- 1. Setup Shared Resources (Same as before) ---
        const sampler = device.createSampler({minFilter: 'linear'});

        // Shader modules are the same (they draw a quad and sample 2D texture)
        // The previous shader code works because we will use a 2D View per layer.

        const vs = `
            struct VSOutput {
                @builtin(position) position: vec4f,
                @location(0) texcoord: vec2f,
            };
    
            @vertex
            fn vs_main(@builtin(vertex_index) vertIndex: u32) -> VSOutput {
                var vsOutput: VSOutput;
                // Vertices for a full-screen quad from -1 to 1 in clip space.
                let pos = array<vec2f, 6>(
                    vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0),
                    vec2f(-1.0, -1.0), vec2f(1.0, 1.0), vec2f(-1.0, 1.0)
                );
                // Corresponding texture coordinates (0 to 1).
                let uv = array<vec2f, 6>(
                    vec2f(0.0, 1.0), vec2f(1.0, 1.0), vec2f(1.0, 0.0),
                    vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(0.0, 0.0)
                );
    
                vsOutput.position = vec4f(pos[vertIndex], 0.0, 1.0);
                vsOutput.texcoord = uv[vertIndex];
                return vsOutput;
            }
        `;
        const fs = `
        @group(0) @binding(0) var ourSampler: sampler;
        @group(0) @binding(1) var ourTexture: texture_2d<f32>; // Note: we use a 2D view!

        struct FSInput {
            @builtin(position) position: vec4f,
            @location(0) texcoord: vec2f,
        };

        @fragment
        fn fs_main(fsInput: FSInput) -> @location(0) vec4f {
            return textureSample(ourTexture, ourSampler, fsInput.texcoord);
        }
    `;

        const module = device.createShaderModule({label: 'Mipmap Array Gen Shaders', code: vs + fs});
        const pipeline = device.createRenderPipeline({
            label: 'Mipmap Array Generator Pipeline',
            layout: 'auto',
            vertex: {module, entryPoint: 'vs_main'},
            fragment: {module, entryPoint: 'fs_main', targets: [{format}]},
            primitive: {topology: 'triangle-list'},
        });

        // --- 2. Encode Commands (Two Nested Loops) ---
        const encoder = device.createCommandEncoder({label: 'Mipmap Array Generator Encoder'});
        const pipelineLayout = pipeline.getBindGroupLayout(0);

        // Outer Loop: Iterate through each mip level to be generated (1 to N-1)
        for (let mipLevel = 1; mipLevel < mipLevelCount; ++mipLevel) {
            // Inner Loop: Iterate through each layer in the array (0 to L-1)
            for (let arrayLayer = 0; arrayLayer < arrayLayerCount; ++arrayLayer) {

                // Source is the previous mip level (mipLevel - 1) of the current layer.
                const sourceView = texture.createView({
                    label: `Mip ${mipLevel - 1} Layer ${arrayLayer} Source`,
                    baseMipLevel: mipLevel - 1,
                    mipLevelCount: 1,
                    baseArrayLayer: arrayLayer, // Target the specific layer
                    arrayLayerCount: 1,
                    dimension: '2d', // Treat the source layer as a single 2D texture
                });

                // Destination is the current mip level (mipLevel) of the current layer.
                const destinationView = texture.createView({
                    label: `Mip ${mipLevel} Layer ${arrayLayer} Destination`,
                    baseMipLevel: mipLevel,
                    mipLevelCount: 1,
                    baseArrayLayer: arrayLayer, // Target the specific layer
                    arrayLayerCount: 1,
                    dimension: '2d', // Treat the destination layer as a single 2D render target
                });

                // Create the Bind Group
                const bindGroup = device.createBindGroup({
                    label: `Mip ${mipLevel} Layer ${arrayLayer} Bind Group`,
                    layout: pipelineLayout,
                    entries: [
                        {binding: 0, resource: sampler},
                        {binding: 1, resource: sourceView},
                    ],
                });

                // Set up and Execute the Render Pass.
                const renderPassDescriptor: GPURenderPassDescriptor = {
                    colorAttachments: [
                        {
                            view: destinationView,
                            clearValue: {r: 0.0, g: 0.0, b: 0.0, a: 0.0},
                            loadOp: 'clear',
                            storeOp: 'store',
                        },
                    ],
                };

                const pass = encoder.beginRenderPass(renderPassDescriptor);
                pass.setPipeline(pipeline);
                pass.setBindGroup(0, bindGroup);
                pass.draw(6); // Draw the full-screen quad
                pass.end();
            }
        }

        // --- 3. Submit Commands ---
        device.queue.submit([encoder.finish()]);
    };
}