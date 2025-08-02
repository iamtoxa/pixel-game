import { Sprite } from "pixi.js";
import type { SpriteConfig, WorldPosition } from "./interfaces";
import type { IsometricObject } from "./Object";
import type { Rectangle } from "../interfaces";

export class IsometricSprite {
    public id: string;
    public worldX: number;
    public worldY: number;
    public worldZ: number;
    public width: number;
    public height: number;
    public depth: number;
    public pixiSprite: Sprite;
    public parentObject: IsometricObject;
    public layer: string;
    public sortPriority: number;
    
    constructor(
        id: string,
        config: SpriteConfig,
        parentObject: IsometricObject,
        worldPos: WorldPosition
    ) {
        this.id = id;
        this.parentObject = parentObject;
        this.layer = config.layer || 'default';
        this.sortPriority = config.sortPriority || 0;
        
        // Вычисляем мировые координаты с учетом смещений
        this.worldX = worldPos.x + config.offsetX;
        this.worldY = worldPos.y + config.offsetY;
        this.worldZ = worldPos.z + config.offsetZ;
        
        this.width = config.width;
        this.height = config.height;
        this.depth = config.depth;
        
        
        // Создаем PIXI спрайт
        this.pixiSprite = Sprite.from(config.textureKey);
        this.updatePixiPosition();
    }
    
    public updateWorldPosition(worldPos: WorldPosition): void {
        const config = this.getConfig();
        this.worldX = worldPos.x + config.offsetX;
        this.worldY = worldPos.y + config.offsetY;
        this.worldZ = worldPos.z + config.offsetZ;
        this.updatePixiPosition();
    }
    
    private updatePixiPosition(): void {
        // Преобразуем изометрические координаты в экранные
        const screenPos = this.parentObject.worldToScreen(
            this.worldX, 
            this.worldY, 
            this.worldZ
        );
        
        
        this.pixiSprite.x = screenPos.x;
        this.pixiSprite.y = screenPos.y;
    }
    
    private getConfig(): SpriteConfig {
        const assetConfig = this.parentObject.getAssetConfig();
        return assetConfig.sprites.find(s => 
            s.textureKey === this.pixiSprite.texture.textureCacheIds[0]
        )!;
    }
    
    public getBounds(): Rectangle {
        return {
            x: this.worldX,
            y: this.worldY,
            width: this.width,
            height: this.height
        };
    }
    
    public getZRange(): { min: number; max: number } {
        return {
            min: this.worldZ,
            max: this.worldZ + this.depth
        };
    }
}
