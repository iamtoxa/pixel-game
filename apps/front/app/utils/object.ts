export const getPath = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, p) => acc?.[p], obj);
};

export function pickObject<Data extends object, Keys extends keyof Data>(
    data: Data,
    keys: Keys[]
  ): Pick<Data, Keys> {
    const result = {} as Pick<Data, Keys>;
  
    for (const key of keys) {
      result[key] = data[key];
    }
  
    return result;
}

export const groupBy = <T>(
    array: T[],
    groupByKey: string | ((item: T) => any)
): { [key: string]: T[] } => {
    const getKey = (item: T): string => {
        if (typeof groupByKey === 'string') {
            return getPath(item, groupByKey);
        }
        return groupByKey(item);
    };

    const res = {} as { [key: string]: T[] };
    const uniqueKeys = [...new Set(array.map(getKey))];

    uniqueKeys.forEach((key) => {
        res[key as string] = array.filter((item) => getKey(item) === key);
    });

    return res;
};

export const omit = <T extends object, K extends Array<(keyof T)>>
(object: T | null | undefined, ...paths: K): Pick<T, Exclude<keyof T, K[number]>> => {
    const res = { ...object } as any;
    for (const key of paths) delete res[key];

    return res;
};

export const chunk = <T>(arr: T[], amount: number): T[][] => {
    const result = [];
    const length = arr.length;

    let start = 0;
    do {
        result.push(arr.slice(start, start + amount));
        start += amount;
    } while (start < length);

    return result;
};

export const xor = <A, B>(first: A[], second: B[]): Array<A | B> => {
    return [
        ...first.filter((x) => !second.includes(x as any)),
        ...second.filter((x) => !first.includes(x as any))
    ];
};
