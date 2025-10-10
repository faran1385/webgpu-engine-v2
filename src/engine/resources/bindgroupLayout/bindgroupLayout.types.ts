import type {GPUBindGroupManagerCreateEntries} from "../bindgroup/bindgroup.types.ts";

export type LayoutManagerCreateEntries = {
    resources: GPUBindGroupManagerCreateEntries["resources"],
    layoutLabel?: string,
}