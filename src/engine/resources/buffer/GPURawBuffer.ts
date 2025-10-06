import {getNanoId} from "../../../helpers/globalHelpler.ts";

export default class GPURawBuffer {
    private nanoID!: string;
    private destroyStatus = false;
    private gpuBuffer!: GPUBuffer;
    private usage!: number;
    private size!: number;
    private label!: string;

    constructor(device: GPUDevice, size: number, usage: number, label: string) {
        this.usage = usage;
        this.size = size;
        this.label = label;
        this.nanoID = getNanoId();
        this.gpuBuffer = device.createBuffer({
            size: size,
            usage: this.usage,
            label: this.label,
        });

    }

    private createGPUBuffer(device: GPUDevice) {
        this.destroyStatus = false;
        this.gpuBuffer = device.createBuffer({
            size: this.size,
            usage: this.usage,
            label: this.label,
        });
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


    isDestroyed(): boolean {
        return this.destroyStatus;
    }

    destroy(): void {
        this.destroyStatus = true;
        this.gpuBuffer.destroy();
    }

    getUsage() {
        return this.usage;
    }

    getSize() {
        return this.size;
    }

    getGPUBuffer() {
        return this.gpuBuffer;
    }

    resizeBuffer(newSize: number, device: GPUDevice) {
        this.size = newSize;
        this.createGPUBuffer(device)
    }
}