export default class CanvasManager {
    private canvas: HTMLCanvasElement;
    private ctx: GPUCanvasContext;
    private preferredFormat: GPUTextureFormat
    private static _instance: CanvasManager;

    private constructor(device: GPUDevice, canvasSelector: string) {
        const canvas = document.querySelector(canvasSelector) as HTMLCanvasElement | null;
        if (!canvas) throw new Error("Canvas element not found!");

        const ctx = canvas.getContext("webgpu");
        if (!ctx) throw new Error("Can't get the canvas of webgpu");

        const preferredFormat = navigator.gpu.getPreferredCanvasFormat()
        ctx.configure({
            device,
            format: preferredFormat
        })


        this.ctx = ctx;
        this.canvas = canvas;
        this.preferredFormat = preferredFormat;

        window.addEventListener("resize", () => this.resizeCanvas(this.canvas))
        this.resizeCanvas(this.canvas)
    }

    public static create(device: GPUDevice, canvasSelector: string) {
        if (!this._instance) {
            this._instance = new CanvasManager(device, canvasSelector);
        }

        return this._instance
    }

    private resizeCanvas(canvas: HTMLCanvasElement) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    getTexture() {
        return this.ctx.getCurrentTexture()
    }

    getTextureView(descriptor: GPUTextureViewDescriptor | undefined = undefined) {
        return this.ctx.getCurrentTexture().createView(descriptor)
    }

    getPreferredFormat() {
        return this.preferredFormat;
    }

    getCanvas() {
        return this.canvas;
    }

    getCtx() {
        return this.ctx;
    }

}