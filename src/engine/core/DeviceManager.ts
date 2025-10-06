import type {DeviceLostFunction, InitEntries} from "./DeviceManager.types.ts";


export default class DeviceManager {
    private static _instance: DeviceManager | null = null;

    private adapterOptions?: GPURequestAdapterOptions;
    private requiredFeatures?: Iterable<GPUFeatureName>;
    private requiredLimits?: Record<string, GPUSize64>;
    private defaultQueueDescriptor?: GPUObjectDescriptorBase;

    public device!: GPUDevice;

    private deviceLostFunctions: DeviceLostFunction[] = [];

    private constructor(T: InitEntries) {
        this.adapterOptions = T.adapterOptions;
        this.requiredFeatures = T.deviceOptions?.requiredFeatures;
        this.requiredLimits = T.deviceOptions?.requiredLimits;
        this.defaultQueueDescriptor = T.deviceOptions?.defaultQueueDescriptor;
    }

    /** Initialize singleton instance asynchronously */
    public static async init(T: InitEntries): Promise<DeviceManager> {
        if (!this._instance) {
            const manager = new DeviceManager(T);
            await manager.initialize();
            this._instance = manager;
        }
        return this._instance;
    }

    /** Global access to the singleton instance */
    public static get instance(): DeviceManager {
        if (!this._instance) throw new Error("DeviceManager not initialized. Call init() first.");
        return this._instance;
    }

    /** Internal initialization */
    private async initialize() {
        const gpu = navigator.gpu;
        if (!gpu) throw new Error("Navigator.gpu is not supported.");

        const adapter = await gpu.requestAdapter(this.adapterOptions);
        if (!adapter) throw new Error("No GPU adapter found.");

        const device = await adapter.requestDevice({
            requiredFeatures: this.requiredFeatures,
            requiredLimits: this.requiredLimits,
            defaultQueue: this.defaultQueueDescriptor,
        });

        if (!device) throw new Error("Failed to create GPU device.");

        this.device = device;

        // Device lost handling
        device.lost.then((info) => {
            this.deviceLostFunctions.forEach((fn) => fn(info));
        });

        // Optional: uncaptured GPU error handling
        device.addEventListener("uncapturederror" as any, (ev: GPUUncapturedErrorEvent) => {
            console.error("Uncaptured GPU error:", ev.error);
        });
    }

    /** Register device lost callback */
    public addDeviceLostFunction(fn: DeviceLostFunction) {
        this.deviceLostFunctions.push(fn);
    }

    /** Feature and limit helpers */
    public getSupportedFeatures() {
        return this.device.features;
    }

    public hasFeature(feature: GPUFeatureName) {
        return this.device.features.has(feature);
    }

    public getLimits() {
        return this.device.limits;
    }

    public getLimit(limitFor: keyof GPUSupportedLimits) {
        return this.device.limits[limitFor];
    }
}
