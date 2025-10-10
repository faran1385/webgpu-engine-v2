import {getNanoId} from "../../../helpers/globalHelpler.ts";
import type {shaderModuleEntries} from "./shaderModule.types.ts";
import {IndestructiveTrackedResource} from "../../core/tracking/IndestructiveTrackedResources.ts";
import ShaderModuleManager from "./ShaderModuleManager.ts";
import {BaseIndestructiveResourceNeeds} from "../BaseResourceNeeds.ts";
import {ShaderModuleTracker} from "../../core/tracking/shaderModuleTracker/shaderModuleTracker.ts";

export default class GPURawShaderModule extends BaseIndestructiveResourceNeeds {
    protected nanoID!: string;
    private code: string
    private label?: string;
    protected tracker: ShaderModuleTracker


    constructor(T: shaderModuleEntries) {
        super();
        this.nanoID = getNanoId();

        this.code = T.code;
        this.label = T.label;
        this.tracker = T.tracker
    }

    clone() {
        return new GPURawShaderModule({
            code: this.code,
            label: this.label,
            tracker: this.tracker
        })
    }

    destroyInternal() {
        const manager = ShaderModuleManager.init();
        manager.removeHash(this.tracker.getHash(), this.nanoID)

        this.tracker.getDependents().forEach(dependent => {
            dependent.removeDependency(this.tracker);
        });

        this.tracker.getDependencies().forEach(dependency => {
            if (dependency instanceof IndestructiveTrackedResource) dependency.removeDependent(this.tracker);
        });

        this.tracker = undefined as any;
        this.code = undefined as any;
        this.label = undefined;
        console.warn(`shader module with nano id ${this.getNanoID()} destroyed`)

    }

    getTracker() {
        return this.tracker;
    }

    getCode(): string {
        return this.code;
    }

    getNanoID(): string {
        return this.nanoID;
    }
}