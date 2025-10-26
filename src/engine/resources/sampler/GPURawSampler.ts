import {type GPURawSamplerEntries, type SamplerChild, type SamplerGraph} from "./sampler.types.ts";
import {getNanoId} from "../../../helpers/globalHelpler.ts";
import {BaseIndestructiveResourceNeeds} from "../BaseResourceNeeds.ts";
import {SamplerTracker} from "../../core/tracking/sampler/SamplerTracker.ts";
import SamplerManager from "./SamplerManager.ts";
import ResourceUpdater from "../../core/resourceUpdater/ResourceUpdater.ts";


export default class GPURawSampler extends BaseIndestructiveResourceNeeds {
    protected nanoID!: string;
    private label?: string;
    private addressModeU: GPUAddressMode;
    private addressModeV: GPUAddressMode;
    private addressModeW: GPUAddressMode;
    private magFilter: GPUFilterMode;
    private minFilter: GPUFilterMode;
    private mipmapFilter: GPUFilterMode;
    private lodMinClamp: number;
    private lodMaxClamp: number;
    private maxAnisotropy: number;
    private compare?: GPUCompareFunction;
    samplerType: GPUSamplerBindingType = "filtering"
    protected tracker: SamplerTracker;
    private graph: SamplerGraph = {
        parents: null,
        children: new Set()
    }
    needsUpdate: boolean = false;

    private updateTo: null | {
        label?: string;
        addressModeU: GPUAddressMode;
        addressModeV: GPUAddressMode;
        addressModeW: GPUAddressMode;
        magFilter: GPUFilterMode;
        minFilter: GPUFilterMode;
        mipmapFilter: GPUFilterMode;
        lodMinClamp: number;
        lodMaxClamp: number;
        maxAnisotropy: number;
        compare?: GPUCompareFunction;
    } = null;

    private manager: SamplerManager;
    isBuilt: boolean = true;

    constructor(T: GPURawSamplerEntries) {
        super();
        this.manager = SamplerManager.init()
        this.tracker = T.tracker
        this.label = T.label;
        this.addressModeU = T.addressModeU ?? "clamp-to-edge";
        this.addressModeV = T.addressModeV ?? "clamp-to-edge";
        this.addressModeW = T.addressModeW ?? "clamp-to-edge";
        this.magFilter = T.magFilter ?? "nearest";
        this.minFilter = T.minFilter ?? "nearest";
        this.mipmapFilter = T.mipmapFilter ?? "nearest";
        this.lodMinClamp = T.lodMinClamp ?? 0;
        this.lodMaxClamp = T.lodMaxClamp ?? 32;
        this.maxAnisotropy = T.maxAnisotropy ?? 1;
        this.compare = T.compare;
        this.nanoID = getNanoId();

    }

    getManager() {
        return this.manager
    }

    private applyUpdates() {
        this.addressModeU = this.updateTo?.addressModeU! ?? this.addressModeU;
        this.addressModeU = this.updateTo?.addressModeU! ?? this.addressModeU;
        this.addressModeW = this.updateTo?.addressModeW! ?? this.addressModeW;
        this.magFilter = this.updateTo?.magFilter! ?? this.magFilter;
        this.minFilter = this.updateTo?.minFilter! ?? this.minFilter;
        this.mipmapFilter = this.updateTo?.mipmapFilter! ?? this.mipmapFilter;
        this.lodMaxClamp = this.updateTo?.lodMaxClamp! ?? this.lodMaxClamp;
        this.lodMinClamp = this.updateTo?.lodMinClamp! ?? this.lodMinClamp;
        this.maxAnisotropy = this.updateTo?.maxAnisotropy! ?? this.maxAnisotropy;
        this.compare = this.updateTo?.compare! ?? this.compare;
        this.label = this.updateTo?.label;


        this.updateTo = null;
        this.isBuilt = true;
        this.needsUpdate = false;
    }

    rebuild() {
        const hash = this.manager.compileHash({
            addressModeU: this.updateTo?.addressModeU ?? this.addressModeU,
            addressModeV: this.updateTo?.addressModeV ?? this.addressModeV,
            addressModeW: this.updateTo?.addressModeW ?? this.addressModeW,
            compare: this.updateTo?.compare ?? this.compare,
            magFilter: this.updateTo?.magFilter ?? this.magFilter,
            mipmapFilter: this.updateTo?.mipmapFilter ?? this.mipmapFilter,
            minFilter: this.updateTo?.minFilter ?? this.minFilter,
            label: this.updateTo?.label ?? this.label,
            maxAnisotropy: this.updateTo?.maxAnisotropy ?? this.maxAnisotropy,
            lodMaxClamp: this.updateTo?.lodMaxClamp ?? this.lodMaxClamp,
            lodMinClamp: this.updateTo?.lodMinClamp ?? this.lodMinClamp,
        });
        ResourceUpdater.init().addToIndestructiveDeleteQueue(this,this.getTracker().getHash());
        this.tracker = this.manager.createOrGetTracker(hash, this);
        this.applyUpdates();
    }

    getUpdateTo() {
        return this.updateTo;
    }

    getLabel() {
        return this.label
    }

    getGraph() {
        return this.graph;
    }

    addChild(child: SamplerChild) {
        this.graph.children.add(child);
    }

    getNanoID(): string {
        return this.nanoID;
    }

    getTracker() {
        return this.tracker;
    }

    destroyInternal() {
    }

    clone() {
        return new GPURawSampler({
            tracker: this.tracker,
            label: this.label,
            compare: this.compare,
            magFilter: this.magFilter,
            mipmapFilter: this.mipmapFilter,
            addressModeV: this.addressModeV,
            addressModeW: this.addressModeW,
            addressModeU: this.addressModeU,
            minFilter: this.mipmapFilter,
            maxAnisotropy: this.maxAnisotropy,
            lodMaxClamp: this.lodMaxClamp,
            lodMinClamp: this.lodMinClamp,
        })
    }

    getCompareFunction() {
        return this.compare
    }

    getMaxAnisotropy() {
        return this.maxAnisotropy
    }

    getLodMaxClamp() {
        return this.lodMaxClamp
    }

    getLodMinClamp() {
        return this.lodMinClamp
    }

    getMipmapFilter() {
        return this.mipmapFilter
    }

    getMinFilter() {
        return this.minFilter
    }

    getMagFilter() {
        return this.magFilter
    }

    getAddressModeW() {
        return this.addressModeW
    }

    getAddressModeU() {
        return this.addressModeU
    }

    getAddressModeV() {
        return this.addressModeV
    }

}



