import {ShaderModuleTracker} from "../../core/tracking/shaderModuleTracker/shaderModuleTracker.ts";

export type shaderModuleEntries = {
    code: string,
    label?: string,
    tracker: ShaderModuleTracker
}

export type ManagerCreateEntries = {
    code: string,
    label?: string,
}