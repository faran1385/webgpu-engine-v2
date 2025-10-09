import DeviceManager from "./engine/core/DeviceManager.ts";
import GPUUniformBuffer from "./engine/resources/buffer/GPUUniformBuffer.ts";
import TextureManager from "./engine/resources/texture/TextureManager.ts";
import SamplerManager from "./engine/resources/sampler/SamplerManager.ts";
import GPUBindgroupManager from "./engine/resources/bindgroup/GPUBindgroupManager.ts";
import ShaderModuleManager from "./engine/resources/shaderModule/ShaderModuleManager.ts";
import GPURenderPipelineManager from "./engine/resources/pipeline/GPURenderPipelineManager.ts";


await DeviceManager.init({});


const textureManager = TextureManager.init()

const url = ("https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630")
const texture2 = await textureManager.createTexture(url, {
    label: "TEST",
    format: "rgba8unorm",
})

const texture1 = await textureManager.createTexture(url, {
    label: "TEST2",
    format: "rgba8unorm",
})


const samplerManager = SamplerManager.init()
const sampler2 = samplerManager.createSampler()

const uniformBuffer = new GPUUniformBuffer({
    data: new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]),
    label: "uniform buffer",
})

const manager = GPUBindgroupManager.init()


const B1 = manager.createBindgroup({
    resources: {
        modelMatrix: {
            resource: uniformBuffer,
            visibility: GPUShaderStage.VERTEX,
        },
        uTexture: {
            resource: texture2,
            visibility: GPUShaderStage.FRAGMENT,
        },
        uSampler: {
            resource: sampler2,
            visibility: GPUShaderStage.FRAGMENT,
        }
    }
})

const B2 = manager.createBindgroup({
    resources: {
        modelMatrix: {
            resource: uniformBuffer,
            visibility: GPUShaderStage.VERTEX,
        },
        uTexture: {
            resource: texture1,
            visibility: GPUShaderStage.FRAGMENT,
        },
        uSampler: {
            resource: sampler2,
            visibility: GPUShaderStage.FRAGMENT,
        }
    }
})


const shaderManager = ShaderModuleManager.init();
const code = '232'
const M1 = shaderManager.createShaderModule({
    code,
    isCopy: false
})

const M2 = shaderManager.createShaderModule({
    code,
    isCopy: false
})

const pipelineManager = GPURenderPipelineManager.init()


const P1 = pipelineManager.createPipeline({
    bindgroupLayouts: [B1.getLayout(), B2.getLayout()],
    vertex: {
        module: M1,
        entryPoint: 'vs',
        buffers: []
    }
})
B1.destroyInternal()
B2.destroyInternal()
console.log(uniformBuffer)