import {ShaderModuleTracker} from "../../core/tracking/shaderModuleTracker/shaderModuleTracker.ts";
import type GPURawRenderPipeline from "../pipeline/GPURawRenderPipeline.ts";

export type shaderModuleEntries = {
    code: string,
    label?: string,
    tracker: ShaderModuleTracker
}

export type ManagerCreateEntries = {
    code: string,
    label?: string,
}

export type ShaderModuleGraph = {
    parents: null,
    children: Set<ShaderModuleChild>
}

export type ShaderModuleChild = GPURawRenderPipeline;
