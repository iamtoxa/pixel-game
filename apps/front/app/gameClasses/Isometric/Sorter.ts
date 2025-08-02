import type { Rectangle } from "../interfaces";
import { QuadTree } from "../QuadTree/QuadTree";
import type { IsometricObject } from "./Object";
import type { IsometricSprite } from "./Sprite";

// Обновленный сортировщик для работы с IsometricObject
export class IsometricObjectSorter {
    private quadTree!: QuadTree;
    private dependencies: Map<string, Set<string>> = new Map();
    private dependents: Map<string, Set<string>> = new Map();
    
    constructor(private objects: IsometricObject[]) {
        this.buildQuadTree();
    }
    
    private buildQuadTree(): void {
        const bounds = this.calculateBounds();
        this.quadTree = new QuadTree(bounds, 10, 5);
        
        // Добавляем все спрайты всех объектов в квадродерево
        this.objects.forEach(obj => {
            obj.getAllSprites().forEach(sprite => {
                const bounds = sprite.getBounds();
                this.quadTree.insert({
                    x: bounds.x,
                    y: bounds.y,
                    width: bounds.width,
                    height: bounds.height,
                    sprite: sprite
                });
            });
        });
    }
    
    private calculateBounds(): Rectangle {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        this.objects.forEach(obj => {
            const bounds = obj.getBounds();
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        });
        
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    
    public sortSprites(): IsometricSprite[] {
        // Получаем все спрайты от всех объектов
        const allSprites: IsometricSprite[] = [];
        this.objects.forEach(obj => {
            allSprites.push(...obj.getSpritesForSorting());
        });
        
        const Q: IsometricSprite[] = [];
        const T: Map<string, IsometricSprite> = new Map();
        const processed = new Set<string>();
        
        // Инициализируем структуры зависимостей
        allSprites.forEach(sprite => {
            this.dependencies.set(sprite.id, new Set());
            this.dependents.set(sprite.id, new Set());
        });
        
        // Сортируем спрайты по координатам для обхода
        const sortedSprites = [...allSprites].sort((a, b) => {
            if (a.worldY !== b.worldY) return a.worldY - b.worldY;
            if (a.worldX !== b.worldX) return a.worldX - b.worldX;
            return a.worldZ - b.worldZ;
        });
        
        // Основной цикл обработки (аналогично предыдущей реализации)
        for (const sprite of sortedSprites) {
            if (processed.has(sprite.id)) continue;
            
            this.findDependencies(sprite);
            
            const spriteDeps = this.dependencies.get(sprite.id)!;
            const canProcess = Array.from(spriteDeps).every(depId => 
                Q.some(s => s.id === depId)
            );
            
            if (canProcess) {
                Q.push(sprite);
                processed.add(sprite.id);
                this.updateDependents(sprite.id, T, Q, processed);
            } else {
                T.set(sprite.id, sprite);
            }
        }
        
        // Обрабатываем оставшиеся спрайты в T
        while (T.size > 0) {
            let addedAny = false;
            
            for (const [spriteId, sprite] of T.entries()) {
                const spriteDeps = this.dependencies.get(spriteId)!;
                const canProcess = Array.from(spriteDeps).every(depId => 
                    Q.some(s => s.id === depId)
                );
                
                if (canProcess) {
                    Q.push(sprite);
                    processed.add(spriteId);
                    T.delete(spriteId);
                    this.updateDependents(spriteId, T, Q, processed);
                    addedAny = true;
                    break;
                }
            }
            
            if (!addedAny) {
                console.warn('Циклическая зависимость обнаружена');
                T.forEach(sprite => Q.push(sprite));
                break;
            }
        }
        
        return Q;
    }
    
    private findDependencies(sprite: IsometricSprite): void {
        const maxHeight = this.getMaxSpriteHeight();
        const bounds = sprite.getBounds();
        
        const searchArea = {
            x: bounds.x,
            y: bounds.y - maxHeight,
            width: bounds.width,
            height: maxHeight
        };
        
        const candidates = this.quadTree.retrieve(searchArea);
        
        for (const candidate of candidates) {
            const otherSprite = candidate.sprite;
            
            if (otherSprite.id === sprite.id) continue;
            
            if (this.shouldDrawBefore(otherSprite, sprite)) {
                this.dependencies.get(sprite.id)!.add(otherSprite.id);
                this.dependents.get(otherSprite.id)!.add(sprite.id);
            }
        }
    }
    
    private shouldDrawBefore(spriteA: IsometricSprite, spriteB: IsometricSprite): boolean {
        const aBounds = spriteA.getBounds();
        const bBounds = spriteB.getBounds();
        const aZRange = spriteA.getZRange();
        const bZRange = spriteB.getZRange();
        
        // Проверяем пересечение по X и Y
        const xOverlap = aBounds.x < bBounds.x + bBounds.width && 
                        aBounds.x + aBounds.width > bBounds.x;
        const yOverlap = aBounds.y < bBounds.y + bBounds.height && 
                        aBounds.y + aBounds.height > bBounds.y;
        
        // Проверяем пересечение по Z
        const zOverlap = aZRange.max > bZRange.min && aZRange.min < bZRange.max;
        
        // Если есть пересечение, то объект с меньшими координатами должен рисоваться раньше
        if (xOverlap && yOverlap && zOverlap) {
            // Приоритет: сначала по Y, затем по X, затем по Z
            if (spriteA.worldY !== spriteB.worldY) {
                return spriteA.worldY < spriteB.worldY;
            }
            if (spriteA.worldX !== spriteB.worldX) {
                return spriteA.worldX < spriteB.worldX;
            }
            return spriteA.worldZ < spriteB.worldZ;
        }
        
        return false;
    }
    
    private updateDependents(
        processedId: string, 
        T: Map<string, IsometricSprite>, 
        Q: IsometricSprite[], 
        processed: Set<string>
    ): void {
        const dependents = this.dependents.get(processedId);
        if (!dependents) return;
        
        for (const dependentId of dependents) {
            if (processed.has(dependentId)) continue;
            
            const dependent = T.get(dependentId);
            if (!dependent) continue;
            
            const deps = this.dependencies.get(dependentId)!;
            const canProcess = Array.from(deps).every(depId => 
                Q.some(s => s.id === depId)
            );
            
            if (canProcess) {
                Q.push(dependent);
                processed.add(dependentId);
                T.delete(dependentId);
                this.updateDependents(dependentId, T, Q, processed);
            }
        }
    }
    
    private getMaxSpriteHeight(): number {
        let maxHeight = 0;
        this.objects.forEach(obj => {
            obj.getAllSprites().forEach(sprite => {
                maxHeight = Math.max(maxHeight, sprite.depth);
            });
        });
        return maxHeight;
    }
}
