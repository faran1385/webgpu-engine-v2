import {nanoid} from "nanoid";

export function getNanoId(){
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
