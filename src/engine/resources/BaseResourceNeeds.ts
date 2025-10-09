import type {IndestructiveTrackedResource} from "../core/tracking/IndestructiveTrackedResources.ts";
import type {DestructiveTrackedResource} from "../core/tracking/destructiveTrackedResources.ts";

export abstract class BaseIndestructiveResourceNeeds {
    abstract clone(): void;

    abstract destroyInternal(): void;

    abstract getNanoID(): string;

    protected abstract nanoID: string;
    protected abstract tracker: IndestructiveTrackedResource;

    abstract getTracker(): IndestructiveTrackedResource;
}

export abstract class BaseDestructiveResourceNeeds {


    abstract getNanoID(): string;

    protected abstract nanoID: string;

    protected abstract tracker: DestructiveTrackedResource;

    abstract destroy(): void;

    abstract getTracker(): DestructiveTrackedResource;
}