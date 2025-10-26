import {nanoid} from "nanoid";

export function getNanoId() {
    return nanoid(12)
}

export function fnv1aHash(str: string): string {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return (h >>> 0).toString(16);
}


export function convertRecordToArray<T>(entries: Record<any, T>) {
    const ArrayEntries: T[] = []
    for (const entry in entries) {
        ArrayEntries.push(entries[entry]);
    }

    return ArrayEntries;
}

export function convertRecordKeysToArray<T extends string | number>(entries: Record<T, any>) {
    const ArrayEntries: T[] = []
    for (const entry in entries) {
        ArrayEntries.push(entry);
    }

    return ArrayEntries;
}



