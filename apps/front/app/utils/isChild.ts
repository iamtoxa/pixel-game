export const isChild = (obj: Element, parentObj: Element, maxDeep = 999): boolean => {
    let deep = 0;
    let currObj = obj;
    while (deep < maxDeep && currObj !== undefined && currObj !== null && currObj.tagName.toUpperCase() !== 'BODY') {
        if (currObj === parentObj) {
            return true;
        }
        deep += 1;
        currObj = currObj.parentNode as Element;
    }
    return false;
};
