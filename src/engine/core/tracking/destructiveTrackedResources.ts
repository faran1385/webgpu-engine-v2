import type GPURawBuffer from "../../resources/buffer/GPURawBuffer.ts";
import type {GPURawTexture} from "../../resources/texture/GPURawTexture.ts";
import {IndestructiveTrackedResource} from "./IndestructiveTrackedResources.ts";

export type DestructiveResource = GPURawBuffer | GPURawTexture

export class DestructiveTrackedResource {
    private dependencies = new Set<IndestructiveTrackedResource>();            // e.g., classes that are using this class or up the chain usages;
    private resource: DestructiveResource;
    private isAutoDestroy: boolean = true;

    constructor(resource: DestructiveResource, isAutoDestroy: boolean) {
        this.resource = resource;
        this.isAutoDestroy = isAutoDestroy;
    }

    addDependency(dependency: IndestructiveTrackedResource) {
        this.dependencies.add(dependency);
    }

    removeDependency(dependency: IndestructiveTrackedResource) {
        if (this.dependencies.delete(dependency) && this.isAutoDestroy) {
            if (this.dependencies.size <= 0) {
                this.resource.destroy();
            }
        }
    }

    getDependencies() {
        return this.dependencies;
    }
}
