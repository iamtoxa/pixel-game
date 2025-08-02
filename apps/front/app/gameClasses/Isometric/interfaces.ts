export interface SpriteConfig {
    textureKey: string;      // Ключ текстуры в PIXI
    offsetX: number;         // Смещение по X относительно якоря объекта
    offsetY: number;         // Смещение по Y относительно якоря объекта
    offsetZ: number;         // Смещение по Z (высота) относительно якоря объекта
    width: number;           // Ширина спрайта в изометрических единицах
    height: number;          // Высота спрайта в изометрических единицах
    depth: number;           // Глубина спрайта в изометрических единицах
    layer?: string;          // Слой спрайта (например, "body", "head", "weapon")
    sortPriority?: number;   // Приоритет сортировки внутри объекта (больше = выше)
}

export interface AssetConfig {
    sprites: SpriteConfig[];
    anchorX?: number;        // Якорь объекта по X (по умолчанию 0.5)
    anchorY?: number;        // Якорь объекта по Y (по умолчанию 0.5)
}

export interface WorldPosition {
    x: number;               // Мировая координата X
    y: number;               // Мировая координата Y
    z: number;               // Мировая координата Z (высота)
}


export interface ViewportBounds {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export interface RenderStats {
    totalObjects: number;
    visibleObjects: number;
    totalSprites: number;
    visibleSprites: number;
    sortTime: number;
    renderTime: number;
}
