import {getNanoId} from "../../../helpers/globalHelpler.ts";
import type {shaderModuleEntries} from "./shaderModule.types.ts";
import DeviceManager from "../../core/DeviceManager.ts";
import {TrackedResource} from "../../core/tracking/TrackedResources.ts";
import ShaderModuleManager from "./ShaderModuleManager.ts";
import BaseResourceNeeds from "../BaseResourceNeeds.ts";

export default class GPURawShaderModule extends BaseResourceNeeds {
    protected nanoID!: string;
    private code: string
    private label?: string;
    private module!: GPUShaderModule;
    protected tracker: TrackedResource


    constructor(T: shaderModuleEntries) {
        super();
        this.nanoID = getNanoId();

        this.code = T.code;
        this.label = T.label;
        this.tracker = T.tracker

        if (T.isCopy) {
            this.module = T.module;
        } else {
            this.createModule()
        }
    }

    clone() {
        return new GPURawShaderModule({
            isCopy: true,
            code: this.code,
            module: this.module,
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
            dependency.removeDependent(this.tracker);
        });

        this.tracker = undefined as any;
        this.code = undefined as any;
        this.label = undefined;

    }

    getTracker() {
        return this.tracker;
    }

    private createModule() {
        const device = DeviceManager.instance.device

        this.module = device.createShaderModule({
            code: this.code,
            label: this.label,
        })
    }

    getModule() {
        return this.module;
    }

    getCode(): string {
        return this.code;
    }

    getNanoID(): string {
        return this.nanoID;
    }
}