export function lerp(y1: number, y2: number, t: number): number {
    return (1 - t) * y1 + t * y2;
}

export function lerpObject<T extends Record<string, number>>(y1: T, y2:T, t: number): T {
    const res = {} as any;

    for (const y1Key of Object.keys(y1)) {
        res[y1Key] = lerp(y1[y1Key], y2[y1Key], Math.min(1, Math.max(0, t)));
    }

    return res as T;
}