import { Assets, Container } from "pixi.js";
import type { AssetConfig, SpriteConfig, WorldPosition } from "./interfaces";
import { IsometricSprite } from "./Sprite";
import type { Rectangle } from "../interfaces";
import { QuadTree } from "../QuadTree/QuadTree";

export class IsometricObject {
    public id: string;
    public assetKey: string;
    public worldPosition: WorldPosition;
    public sprites: Map<string, IsometricSprite> = new Map();
    public container: Container;
    
    private static assetConfigs: Map<string, AssetConfig> = new Map();
    private static tileSize: number = 64; // Размер тайла в пикселях
    
    constructor(
        id: string,
        assetKey: string,
        worldPosition: WorldPosition
    ) {
        this.id = id;
        this.assetKey = assetKey;
        this.worldPosition = { ...worldPosition };
        this.container = new Container();
        
        this.createSprites();
    }
    
    // Статический метод для регистрации конфигураций ассетов
    public static async registerAsset(key: string, config: AssetConfig) {
        this.assetConfigs.set(key, config);

        const loaders = [];
        for (const element of config.sprites) {
            loaders.push(Assets.load(element.textureKey))
        }

        return await Promise.all(loaders)
    }
    
    public static setTileSize(size: number): void {
        this.tileSize = size;
    }
    
    public getAssetConfig(): AssetConfig {
        const config = IsometricObject.assetConfigs.get(this.assetKey);
        if (!config) {
            throw new Error(`Asset config not found for key: ${this.assetKey}`);
        }
        return config;
    }
    
    private createSprites(): void {
        const config = this.getAssetConfig();
        
        config.sprites.forEach((spriteConfig, index) => {
            const spriteId = `${this.id}_sprite_${index}`;
            const sprite = new IsometricSprite(
                spriteId,
                spriteConfig,
                this,
                this.worldPosition
            );
            
            this.sprites.set(spriteConfig.layer || `sprite_${index}`, sprite);
            this.container.addChild(sprite.pixiSprite);
        });
    }
    
    public setWorldPosition(position: WorldPosition): void {
        this.worldPosition = { ...position };
        
        // Обновляем позиции всех спрайтов
        this.sprites.forEach(sprite => {
            sprite.updateWorldPosition(this.worldPosition);
        });
    }
    
    public getSprite(layer: string): IsometricSprite | undefined {
        return this.sprites.get(layer);
    }
    
    public getAllSprites(): IsometricSprite[] {
        return Array.from(this.sprites.values());
    }
    
    public getSpritesForSorting(): IsometricSprite[] {
        // Возвращаем спрайты, отсортированные по внутреннему приоритету
        return Array.from(this.sprites.values()).sort((a, b) => {
            // Сначала по Z-координате (выше = позже)
            if (a.worldZ !== b.worldZ) {
                return a.worldZ - b.worldZ;
            }
            // Затем по приоритету сортировки
            return a.sortPriority - b.sortPriority;
        });
    }
    
    public worldToScreen(worldX: number, worldY: number, worldZ: number): { x: number; y: number } {
        // Преобразование изометрических координат в экранные
        const tileSize = IsometricObject.tileSize;
        
        const screenX = (worldX - worldY) * (tileSize / 2);
        const screenY = (worldX + worldY) * (tileSize / 4) - worldZ * (tileSize / 2);
        
        return { x: screenX, y: screenY };
    }
    
    public screenToWorld(screenX: number, screenY: number, worldZ: number = 0): WorldPosition {
        // Обратное преобразование экранных координат в изометрические
        const tileSize = IsometricObject.tileSize;
        
        const adjustedY = screenY + worldZ * (tileSize / 2);
        const worldX = (screenX / (tileSize / 2) + adjustedY / (tileSize / 4)) / 2;
        const worldY = (adjustedY / (tileSize / 4) - screenX / (tileSize / 2)) / 2;
        
        return { x: worldX, y: worldY, z: worldZ };
    }
    
    public getBounds(): Rectangle {
        // Возвращаем общие границы всех спрайтов объекта
        if (this.sprites.size === 0) {
            return { x: this.worldPosition.x, y: this.worldPosition.y, width: 0, height: 0 };
        }
        
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        this.sprites.forEach(sprite => {
            const bounds = sprite.getBounds();
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        });
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    
    public getZRange(): { min: number; max: number } {
        if (this.sprites.size === 0) {
            return { min: this.worldPosition.z, max: this.worldPosition.z };
        }
        
        let minZ = Infinity, maxZ = -Infinity;
        
        this.sprites.forEach(sprite => {
            const range = sprite.getZRange();
            minZ = Math.min(minZ, range.min);
            maxZ = Math.max(maxZ, range.max);
        });
        
        return { min: minZ, max: maxZ };
    }
    
    public setVisible(visible: boolean): void {
        this.container.visible = visible;
    }
    
    public destroy(): void {
        this.sprites.forEach(sprite => {
            sprite.pixiSprite.destroy();
        });
        this.sprites.clear();
        this.container.destroy();
    }
    
    // Метод для анимации (смена текстур спрайтов)
    public setAnimation(animationKey: string): void {
        // Здесь можно реализовать логику смены текстур для анимации
        // Например, загрузить новый набор текстур и обновить спрайты
    }
    
    // Метод для получения спрайта по мировым координатам (для проверки пересечений)
    public getSpriteAt(worldX: number, worldY: number, worldZ: number): IsometricSprite | null {
        for (const sprite of this.sprites.values()) {
            const bounds = sprite.getBounds();
            const zRange = sprite.getZRange();
            
            if (worldX >= bounds.x && worldX < bounds.x + bounds.width &&
                worldY >= bounds.y && worldY < bounds.y + bounds.height &&
                worldZ >= zRange.min && worldZ < zRange.max) {
                return sprite;
            }
        }
        return null;
    }
}
