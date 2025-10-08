import type {TrackedResource} from "../core/tracking/TrackedResources.ts";

export default abstract class BaseResourceNeeds {
    abstract clone(): void;

    abstract destroyInternal(): void;

    abstract getNanoID(): string;

    protected abstract nanoID: string;
    protected abstract tracker: TrackedResource;

    abstract getTracker(): TrackedResource;
}