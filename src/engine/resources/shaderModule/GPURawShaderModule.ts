import {getNanoId} from "../../../helpers/globalHelpler.ts";
import type {ShaderModuleChild, shaderModuleEntries, ShaderModuleGraph} from "./shaderModule.types.ts";
import {BaseIndestructiveResourceNeeds} from "../BaseResourceNeeds.ts";
import {ShaderModuleTracker} from "../../core/tracking/shaderModuleTracker/shaderModuleTracker.ts";
import ShaderModuleManager from "./ShaderModuleManager.ts";
import ResourceUpdater from "../../core/resourceUpdater/ResourceUpdater.ts";


export default class GPURawShaderModule extends BaseIndestructiveResourceNeeds {
    protected nanoID!: string;
    private code: string
    private label?: string;
    protected tracker: ShaderModuleTracker
    private graph: ShaderModuleGraph = {
        parents: null,
        children: new Set()
    }
    isBuilt: boolean = true;

    needsUpdate: boolean = false;
    private updateTo: null | {
        code: string
        label?: string;
    } = null
    private resourceUpdater: ResourceUpdater

    private manager: ShaderModuleManager;

    constructor(T: shaderModuleEntries) {
        super();
        this.resourceUpdater = ResourceUpdater.init();
        this.nanoID = getNanoId();
        this.manager = ShaderModuleManager.init()
        this.code = T.code;
        this.label = T.label;
        this.tracker = T.tracker
    }

    getManager() {
        return this.manager
    }

    private applyUpdates() {
        this.code = this.updateTo?.code! ?? this.code;

        this.label = this.updateTo?.label;


        this.updateTo = null;
        this.isBuilt = true;
        this.needsUpdate = false;
    }

    rebuild() {
        const hash = this.manager.compileHash(this.updateTo?.code ?? this.code);
        ResourceUpdater.init().addToIndestructiveDeleteQueue(this,this.tracker.getHash());
        this.tracker = this.manager.createOrGetTracker(hash, this)
        this.applyUpdates()
    }

    getUpdateTo() {
        return this.updateTo
    }

    getLabel() {
        return this.label;
    }

    addChild(child: ShaderModuleChild) {
        this.graph.children.add(child);
    }

    getGraph() {
        return this.graph;
    }


    clone() {
        return new GPURawShaderModule({
            code: this.code,
            label: this.label,
            tracker: this.tracker,
        })
    }


    setCode(code: string) {

        const newHash = this.manager.compileHash(code);

        this.updateTo = {
            code,
            label: this.label
        }

        if (newHash === this.tracker.getHash()) {
            this.resourceUpdater.removeFromUpdateQueue(this)
            this.updateTo = null
            this.needsUpdate = false;
        } else {

            this.needsUpdate = true;
            this.resourceUpdater.addToUpdateQueue(this)
        }
    }

    destroyInternal() {}

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