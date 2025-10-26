import {getNanoId} from "../../../helpers/globalHelpler.ts";
import DeviceManager from "../../core/DeviceManager.ts";

import type {BufferChild, BufferGraph, GPURawBufferEntries} from "./buffer.types.ts";
import {BaseDestructiveResourceNeeds} from "../BaseResourceNeeds.ts";
import BufferTracker from "../../core/tracking/bufferTracker/BufferTracker.ts";


export default class GPURawBuffer extends BaseDestructiveResourceNeeds {
    protected nanoID!: string;
    private usage!: number;
    private size!: number;
    private label?: string;
    protected tracker: BufferTracker;
    private graph: BufferGraph = {
        parents: null,
        children: new Set()
    }
    needsUpdate: boolean = false;
    isBuilt: boolean = true;

    constructor(T: GPURawBufferEntries) {
        super();
        const device = DeviceManager.instance.device
        this.usage = T.usage;
        this.size = T.size;
        this.label = T.label;
        this.nanoID = getNanoId();
        this.tracker = new BufferTracker(device.createBuffer({
            size: this.size,
            usage: this.usage,
            label: this.label,
        }), T.isAutoDestroy ?? true);
    }

    rebuild() {

    }

    getGraph() {
        return this.graph;
    }

    getTracker() {
        return this.tracker;
    }

    getNanoID(): string {
        return this.nanoID;
    }

    getBufferUsageKeys() {
        const usageMap = {
            'MAP_READ': 0x0001,
            'MAP_WRITE': 0x0002,
            'COPY_SRC': 0x0004,
            'COPY_DST': 0x0008,
            'INDEX': 0x0010,
            'VERTEX': 0x0020,
            'UNIFORM': 0x0040,
            'STORAGE': 0x0080,
            'INDIRECT': 0x0100,
            'QUERY_RESOLVE': 0x0200,
        };
        const usedFlags = [];
        for (const key in usageMap) {
            if ((this.usage & (usageMap as any)[key]) !== 0) {
                usedFlags.push(key);
            }
        }
        return usedFlags;
    }



    addChild(child: BufferChild) {
        this.graph.children.add(child);
    }

    destroy(): void {
        this.graph.children.forEach(child => {
            child.removeParent(this);
        });
        console.warn(`buffer with nano id ${this.getNanoID()} destroyed`)
    }

    getUsage() {
        return this.usage;
    }

    getSize() {
        return this.size;
    }

}