import type {IndestructiveWrapperClass, WrapperClass} from "../../resources/BaseResourceNeeds.ts";

export default class ResourceUpdater {
    private static _instance: ResourceUpdater;
    private updateQueue: Set<WrapperClass> = new Set<WrapperClass>()
    private inDestructiveDeleteSchedule: Map<IndestructiveWrapperClass, string> = new Map()

    private constructor() {
    }

    static init() {
        if (!ResourceUpdater._instance) {
            ResourceUpdater._instance = new ResourceUpdater();
        }

        return ResourceUpdater._instance
    }

    private markChildren(wrapperClass: WrapperClass) {
        wrapperClass.getGraph().children?.forEach(child => {
            child.isBuilt = false;
        })
    }

    private getDirtyRootParents(node: WrapperClass): WrapperClass[] {
        const dirtyRoots: WrapperClass[] = [];

        function traverse(current: WrapperClass) {
            const parents = current.getGraph()?.parents;
            const hasParents = parents && parents.size > 0;
            const hasDirtyParent = hasParents
                ? Array.from(parents as Set<any>).some(parent => parent.needsUpdate)
                : false;
            if (!hasDirtyParent) {
                dirtyRoots.push(current);
            }
            if (hasParents) {
                for (const parent of parents!) {
                    traverse(parent);
                }
            }
        }

        if (node.needsUpdate) {
            traverse(node);

            dirtyRoots.forEach(root => {
                root.isBuilt = false
                this.markChildren(root);
            })

        } else {
            this.updateQueue.delete(node)
        }

        return dirtyRoots;
    }

    addToUpdateQueue(wrapperClass: WrapperClass) {
        this.updateQueue.add(wrapperClass)
    }


    removeFromUpdateQueue(wrapperClass: WrapperClass) {
        this.updateQueue.delete(wrapperClass)
    }


    addToIndestructiveDeleteQueue(wrapperClass: IndestructiveWrapperClass, hash: string) {
        this.inDestructiveDeleteSchedule.set(wrapperClass, hash)
    }

    removeIndestructiveFromDeleteQueue(wrapperClass: IndestructiveWrapperClass) {
        this.inDestructiveDeleteSchedule.delete(wrapperClass)
    }

    private findRoots() {
        this.updateQueue.forEach(child => {
            this.getDirtyRootParents(child)
        })
    }

    rebuildChildren(wrapperClass: WrapperClass) {
        wrapperClass.getGraph().children?.forEach(child => {
            if (!child.isBuilt) {
                child.rebuild();
            }
            this.rebuildChildren(child);
        })
    }

    update() {
        if (this.updateQueue.size <= 0) return;
        this.findRoots()

        this.updateQueue.forEach(item => {
            if (!item.isBuilt) {
                item.rebuild();
            }
        })

        this.updateQueue.forEach((child) => {
            this.rebuildChildren(child);
        })

        this.updateQueue.clear()

        // this.inDestructiveDeleteSchedule.forEach((hash, item) => {
        //     item.getManager().removeResource(hash, item.getNanoID())
        // })
        //
        // this.inDestructiveDeleteSchedule.clear()
    }
}