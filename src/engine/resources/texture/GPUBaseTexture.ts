import {GPURawTexture} from "./GPURawTexture.ts";
import type {GPUBaseTextureEntries} from "./texture.types.ts";
import DeviceManager from "../../core/DeviceManager.ts";

export default class GPUBaseTexture extends GPURawTexture {
    private viewDimension: GPUTextureViewDimension = "2d";

    constructor(T: GPUBaseTextureEntries) {

        super({
            ...T,
            depthOrArrayLayers: 1
        });
    }

    getViewDimension() {
        return this.viewDimension;
    }

    resize(width: number, height: number, mipmapCount: number) {
        this.width = width;
        this.height = height;
        this.mipmapCount = mipmapCount;
        this.destroy()
        this.createTexture();
    }

    /**
     * Generates all mipmap levels for a GPUTexture using a render pass.
     * * @param {GPUDevice} device The WebGPU device.
     * * @param {GPUTexture} texture The texture to generate mipmaps for.
     * @returns {void}
     */
    generateMipmaps() {
        const device=DeviceManager.instance.device

        const texture = this.getTexture();
        const mipLevelCount = this.getMipmapCount();
        const format = this.getFormat();

        // --- 1. Setup Shared Resources (Pipelines and Sampler) ---
        // A single linear sampler is used for all downsampling passes.
        const sampler = device.createSampler({
            label: 'Mipmap Generator Sampler',
            minFilter: 'linear',
        });

        // We'll create a render pipeline lazily, one for each format if necessary.
        // For simplicity, we assume one format here.

        // Vertex Shader: Draws a full-screen quad (6 vertices).
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

        // Fragment Shader: Samples the previous mip level and outputs to the current level.
        const fs = `
        @group(0) @binding(0) var ourSampler: sampler;
        @group(0) @binding(1) var ourTexture: texture_2d<f32>;

        struct FSInput {
            @builtin(position) position: vec4f,
            @location(0) texcoord: vec2f,
        };

        @fragment
        fn fs_main(fsInput: FSInput) -> @location(0) vec4f {
            // Sample the texture. The linear filter will average the 4 texels 
            // in the previous level that cover the current pixel.
            return textureSample(ourTexture, ourSampler, fsInput.texcoord);
        }
    `;

        // Create the pipeline for mipmap generation
        const module = device.createShaderModule({label: 'Mipmap Gen Shaders', code: vs + fs});
        const pipeline = device.createRenderPipeline({
            label: 'Mipmap Generator Pipeline',
            layout: 'auto',
            vertex: {
                module,
                entryPoint: 'vs_main',
            },
            fragment: {
                module,
                entryPoint: 'fs_main',
                targets: [{format}], // The destination mip level's format
            },
            primitive: {
                topology: 'triangle-list',
            },
        });

        // --- 2. Encode Commands to Generate Mip Levels ---
        const encoder = device.createCommandEncoder({label: 'Mipmap Generator Encoder'});
        const pipelineLayout = pipeline.getBindGroupLayout(0);

        for (let i = 1; i < mipLevelCount; ++i) {
            // Source is the previous mip level (i-1), as a texture to sample from.
            const sourceView = texture.createView({
                label: `Mip Level ${i - 1} Source View`,
                baseMipLevel: i - 1,
                mipLevelCount: 1,
            });

            // Destination is the current mip level (i), as a render target.
            const destinationView = texture.createView({
                label: `Mip Level ${i} Destination View`,
                baseMipLevel: i,
                mipLevelCount: 1,
            });

            // Create the Bind Group, linking the sampler and the source texture view.
            const bindGroup = device.createBindGroup({
                label: `Mip Level ${i} Bind Group`,
                layout: pipelineLayout,
                entries: [
                    {binding: 0, resource: sampler},
                    {binding: 1, resource: sourceView},
                ],
            });

            // Set up the Render Pass.
            const renderPassDescriptor: GPURenderPassDescriptor = {
                label: `Mip Level ${i} Render Pass`,
                colorAttachments: [
                    {
                        view: destinationView,
                        loadOp: 'clear', // Clear it (or just use 'loadOp: clear')
                        storeOp: 'store',
                    },
                ],
            };

            // Execute the Render Pass.
            const pass = encoder.beginRenderPass(renderPassDescriptor);
            pass.setPipeline(pipeline);
            pass.setBindGroup(0, bindGroup);
            pass.draw(6); // Draw the full-screen quad
            pass.end();
        }

        // --- 3. Submit Commands ---
        device.queue.submit([encoder.finish()]);
    };
}