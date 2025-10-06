import GPURawBindgroup from "./GPURawBindgroup.ts";
import type { GPUBaseBindgroupEntries} from "./bindgroup.types.ts";
export default class GPUBaseBindgroup extends GPURawBindgroup {

    constructor(device: GPUDevice, T: GPUBaseBindgroupEntries) {
        super(device, {
            layout: T.layout,
            entries: T.entries,
            label: T.label,
            boundResources: T.boundResources,
        }, T.hash);
    }
}