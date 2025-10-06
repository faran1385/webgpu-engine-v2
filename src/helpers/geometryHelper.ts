import {fnv1aHash} from "./globalHelpler.ts";
import type {GeometryEntries} from "../engine/geometry/geometry.types.ts";

export function getGeometryHash(T:{
    buffers: GeometryEntries["buffers"],
    primitive?: GeometryEntries["primitive"]
}){
    // === Vertex Stage ===
    let vertexHash = [
        `buffers:${T.buffers.map(i => i.getNanoID()).join(",")}`,
    ].join("|");



    // === Primitive State ===
    const primitive = [
        `stripIndexFormat:${T.primitive?.stripIndexFormat ?? "none"}`,
        `topology:${T.primitive?.topology ?? "triangle-list"}`,
    ].join("|");


    // === Final Composite String ===
    const finalString = [
        `vertex:${vertexHash}`,
        `primitive:${primitive}`,
    ].join("||");

    // Return as string (in hex for readability)
    return fnv1aHash(finalString);
}