import type {MaterialCreateEntries} from "./material.types.ts";
import ShaderModuleManager from "../resources/shaderModule/ShaderModuleManager.ts";
import GPURawMaterial from "./GPURawMaterial.ts";
import {getMaterialHash} from "../../helpers/materialHelper.ts";


export default class MaterialManager {
    private static instance: MaterialManager;
    private shaderModuleManager: ShaderModuleManager
    private cache: Map<string, GPURawMaterial> = new Map();

    private constructor() {
        this.shaderModuleManager = ShaderModuleManager.init();
    }

    public static init() {
        if (!this.instance) {
            this.instance = new MaterialManager();
        }

        return this.instance;
    }

    public create(T: MaterialCreateEntries) {
        const vertexModule = this.shaderModuleManager.createShaderModule({
            code: T.vertex.shader,
            isCopy:false
        })

        const fragmentModule = T.fragment ? this.shaderModuleManager.createShaderModule({
            code: T.fragment.shader,
            isCopy:false
        }) : null

        const materialEntries = {
            ...T,
            vertex: {
                ...T.vertex,
                module: vertexModule
            },
            fragment: T.fragment ? {
                ...T.fragment,
                module: fragmentModule!
            } : undefined
        }
        const materialHash = getMaterialHash(materialEntries)

        if (this.cache.has(materialHash)) return this.cache.get(materialHash)!;

        const material = new GPURawMaterial({
            ...materialEntries,
            hash: materialHash,
        })

        this.cache.set(materialHash, material)

        return material;
    }
}