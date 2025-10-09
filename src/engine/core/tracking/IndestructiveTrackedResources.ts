import type {DestructiveTrackedResource} from "./destructiveTrackedResources.ts";

export type TrackedResource = DestructiveTrackedResource | IndestructiveTrackedResource;

export class IndestructiveTrackedResource {
    private hash: string;
    private dependencies = new Set<TrackedResource>();            // e.g., classes that are using this class or up the chain usages;
    private dependents = new Set<TrackedResource>(); // e.g., classes that are used by this class or down the chain usages

    constructor(hash: string) {
        this.hash = hash;
    }

    copyTracker(hash: string, dependencies: Set<TrackedResource>, dependents: Set<TrackedResource>) {
        this.hash = hash;
        this.dependencies = dependencies;
        this.dependents = dependents;
    }


    getDependents() {
        return this.dependents;
    }

    addDependent(dependent: TrackedResource) {
        this.dependents.add(dependent);
    }

    removeDependent(dependent: TrackedResource) {
        this.dependents.delete(dependent);
    }

    addDependency(dependency: TrackedResource) {
        this.dependencies.add(dependency);
    }

    removeDependency(dependency: TrackedResource) {
        this.dependencies.delete(dependency)
    }

    getDependencies() {
        return this.dependencies;
    }

    getHash() {
        return this.hash;
    }
}
