import type GPURawBuffer from "../../resources/buffer/GPURawBuffer.ts";
import type {GPURawTexture} from "../../resources/texture/GPURawTexture.ts";
import TrackedResource from "./TrackedResource.ts";

export type DestructiveResource = GPURawBuffer | GPURawTexture


export class DestructiveTrackedResource extends TrackedResource {
    protected destroyStatus = false;
    isAutoDestroy: boolean = true;

    constructor(isAutoDestroy: boolean) {
        super();
        this.isAutoDestroy = isAutoDestroy;
    }

    isDestroyed(): boolean {
        return this.destroyStatus;
    }

}
