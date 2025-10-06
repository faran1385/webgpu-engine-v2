import GPURawBindgroupLayout from "./GPURawBindgroupLayout.ts";
import type {GPUBaseBindgroupLayoutEntries} from "./bindgroup.types.ts";

export default class GPUBaseBindgroupLayout extends GPURawBindgroupLayout {

    constructor(device: GPUDevice, T: GPUBaseBindgroupLayoutEntries) {

        super(device, {
            label: T.label,
            entries: T.entries
        }, T.hash);
    }


}