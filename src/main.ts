import DeviceManager from "./engine/core/DeviceManager.ts";
import GPUVertexBuffer from "./engine/resources/buffer/GPUVertexBuffer.ts";
import GPUUniformBuffer from "./engine/resources/buffer/GPUUniformBuffer.ts";
import GPUIndexBuffer from "./engine/resources/buffer/GPUIndexBuffer.ts";
import CanvasManager from "./engine/core/CanvasManager.ts";
import TextureManager from "./engine/resources/texture/TextureManager.ts";
import SamplerManager from "./engine/resources/sampler/SamplerManager.ts";
import MaterialManager from "./engine/material/MaterialManager.ts";
import GeometryManager from "./engine/geometry/GeometryManager.ts";
import MeshManager from "./engine/mesh/MeshManager.ts";


const deviceManager = await DeviceManager.init({});

const device = deviceManager.device;

const canvasManager = CanvasManager.create(device, "#drawing-canvas")

const manager = TextureManager.init()

const url = ("https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630")
const texture = await manager.createTexture(url, {
    label: "TEST",
    format: "rgba8unorm",
})


const samplerManager = SamplerManager.init()
const sampler2 = samplerManager.createSampler(device)

const data = new Float32Array([
    -0.5, 0.5, // V0
    0.5, 0.5, // V1
    -0.5, -0.5, // V2
    0.5, -0.5, // V3
])

const uvData = new Float32Array([
    0, 1,
    1, 1,
    0, 0,
    1, 0,
])

const indexData = new Uint16Array([
    0, 2, 3, // Triangle 1: V0, V2, V3
    0, 3, 1, // Triangle 2: V0, V3, V1
])

const indexBuffer = new GPUIndexBuffer({
    data: indexData,
    label: "index"
})

const vertexBuffer = new GPUVertexBuffer({
    data: data, label: "vertex", layout: {
        arrayStride: 2 * 4,
        attributes: [{
            offset: 0,
            shaderLocation: 0,
            format: "float32x2"
        }]
    }
})
const uvVertexBuffer = new GPUVertexBuffer({
    data: uvData, label: "uv", layout: {
        arrayStride: 2 * 4,
        attributes: [{
            offset: 0,
            shaderLocation: 1,
            format: "float32x2"
        }]
    }
})

const uniformBuffer = new GPUUniformBuffer({
    data: new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]),
    label: "uniform buffer",
})

const vertexShader = `
    struct vsIn{
        @location(0) position:vec2f,
        @location(1) uv:vec2f,
    }
    

    struct vsOut{
        @builtin(position) position:vec4f,
        @location(0) uv:vec2f,
    }

    @group(0) @binding(0) var<uniform> modelMatrix:mat4x4<f32>;

    @vertex fn vs(in:vsIn)-> vsOut{
    
        var out:vsOut;
        
        out.position= modelMatrix * vec4f(in.position,0.,1.);
        out.uv= in.uv;
        
        return out;
    }
`


const fragmentShader = `
    struct fsIn{
        @location(0) uv:vec2f,
    }

    @group(0) @binding(1) var testTexture:texture_2d<f32>;
    @group(0) @binding(2) var testSampler:sampler;

    @fragment fn fs(in:fsIn)->@location(0) vec4f{
        let data=textureSample(testTexture,testSampler,vec2f(in.uv.x,1. - in.uv.y));
        return data;
    }
`

const materialManager = MaterialManager.init()

const material = materialManager.create({
    vertex: {
        entryPoint: "vs",
        shader: vertexShader,
    },
    fragment: {
        entryPoint: "fs",
        shader: fragmentShader,
        targets: [{
            format: canvasManager.getPreferredFormat(),
        }],
    },
    resources: {
        modelMatrix: {
            resource: uniformBuffer,
            visibility: GPUShaderStage.VERTEX,
        },
        uTexture: {
            resource: texture,
            visibility: GPUShaderStage.FRAGMENT,
        },
        uSampler: {
            resource: sampler2,
            visibility: GPUShaderStage.FRAGMENT,
        }
    }
})
const geometryManager = GeometryManager.init()

const geometry = geometryManager.create({
    buffers: [
        vertexBuffer,
        uvVertexBuffer
    ],
    indexBuffer
})
const meshManager = MeshManager.init();
const mesh = meshManager.create({
    geometry,
    material
})

mesh.getBindgroup().getLayout().setEntries({
    uTexture: {
        resource: texture,
        visibility: GPUShaderStage.FRAGMENT,
    },
    uSampler: {
        resource: sampler2,
        visibility: GPUShaderStage.FRAGMENT,
    }
})
console.log(mesh.getBindgroup().getLayout())
const indirectBuffer = device.createBuffer({
    usage: GPUBufferUsage.INDIRECT | GPUBufferUsage.COPY_DST,
    size: 5 * 4,
    label: "indirect texture"
});
device.queue.writeBuffer(indirectBuffer, 0, new Uint32Array([
    indexData.length, // count: 6
    1,                // instanceCount: 1
    0,                // firstIndex: 0
    0,                // baseVertex: 0
    0,                // firstInstance: 0
]))

const render = () => {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
        label: "render pass",
        colorAttachments: [{
            clearValue: [1., 1., 1., 1.],
            storeOp: "store",
            loadOp: "clear",
            view: canvasManager.getTextureView()
        }]
    });

    pass.setPipeline(mesh.getPipeline().getTracker().getPipeline())
    pass.setBindGroup(0, mesh.getBindgroup().getTracker().getBindgroup())
    mesh.getGeometry().getVertexBuffers().forEach((vertexBuffer, i) => {
        pass.setVertexBuffer(i, vertexBuffer.getGPUBuffer())
    })
    pass.setIndexBuffer(mesh.getGeometry().getIndexBuffer()?.getGPUBuffer()!, mesh.getGeometry().getIndexBuffer()!.getFormat())
    pass.drawIndexedIndirect(indirectBuffer, 0)

    pass.end()
    device.queue.submit([encoder.finish()])
    requestAnimationFrame(render)
}
render()