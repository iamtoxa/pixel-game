import { Container, EventEmitter, Rectangle as PIXIRectangle, type Application } from "pixi.js";
import { IsometricObject } from "./Object";
import { IsometricObjectSorter } from "./Sorter";
import type { RenderStats, ViewportBounds, WorldPosition } from "./interfaces";
import type { IsometricSprite } from "./Sprite";
import { SpatialGrid } from "../SpatialGrid/SpatialGrid";
import { IsometricCamera } from "./Camera";
import type { Rectangle } from "../interfaces";

export class IsometricScene {
    private app: Application;
    private worldContainer: Container;
    // private uiContainer: Container;
    
    // Управление объектами
    private objects: Map<string, IsometricObject> = new Map();
    private spatialGrid: SpatialGrid;
    private sorter: IsometricObjectSorter | null = null;
    
    // Камера и viewport
    private camera: IsometricCamera;
    private viewport: ViewportBounds = { left: 0, right: 0, top: 0, bottom: 0 };
    
    // Оптимизация рендеринга
    private needsResort = true;
    private needsViewportUpdate = true;
    private sortedSprites: IsometricSprite[] = [];
    private visibleObjects: Set<string> = new Set();
    
    // Настройки производительности
    private maxVisibleSprites = 1000;
    private sortingEnabled = true;
    private frustumCullingEnabled = true;
    private lodEnabled = true;
    
    // Статистика
    private stats: RenderStats = {
        totalObjects: 0,
        visibleObjects: 0,
        totalSprites: 0,
        visibleSprites: 0,
        sortTime: 0,
        renderTime: 0
    };
    
    constructor(app: Application, worldSize: { width: number; height: number }) {
        this.app = app;
        
        // Создаем контейнеры
        this.worldContainer = new Container();
        // this.uiContainer = new Container();
        
        // Настраиваем сортировку
        this.worldContainer.sortableChildren = true;
        
        this.app.stage.addChild(this.worldContainer);
        // this.app.stage.addChild(this.uiContainer);
        
        // Инициализируем камеру
        this.camera = new IsometricCamera(this.worldContainer);
        
        // Инициализируем пространственную сетку
        this.spatialGrid = new SpatialGrid(worldSize.width, worldSize.height, 32);
        
        // Подписываемся на события
        this.setupEventListeners();
        
        // Запускаем цикл рендеринга
        this.app.ticker.add(this.update, this);
    }
    
    private setupEventListeners(): void {
        // Обновление viewport при изменении камеры
        this.camera.on('moved', () => {
            this.needsViewportUpdate = true;
        });
        
        // Обработка изменения размера экрана
        this.app.renderer.on('resize', () => {
            this.needsViewportUpdate = true;
        });
    }
    
    // Управление объектами
    public addObject(object: IsometricObject): void {
        if (this.objects.has(object.id)) {
            console.warn(`Object with id ${object.id} already exists`);
            return;
        }
        
        this.objects.set(object.id, object);
        this.worldContainer.addChild(object.container);
        
        // Добавляем в пространственную сетку
        this.spatialGrid.addObject(object);
        
        this.needsResort = true;
        this.stats.totalObjects++;
    }
    
    public removeObject(objectId: string): void {
        const object = this.objects.get(objectId);
        if (!object) return;
        
        this.worldContainer.removeChild(object.container);
        this.objects.delete(objectId);
        this.spatialGrid.removeObject(object);
        
        this.needsResort = true;
        this.stats.totalObjects--;
    }
    
    public getObject(objectId: string): IsometricObject | undefined {
        return this.objects.get(objectId);
    }
    
    public moveObject(objectId: string, position: WorldPosition): void {
        const object = this.objects.get(objectId);
        if (!object) return;
        
        // Обновляем позицию в пространственной сетке
        this.spatialGrid.updateObject(object, position);
        
        // Обновляем позицию объекта
        object.setWorldPosition(position);
        
        this.needsResort = true;
    }
    
    // Основной цикл обновления
    private update(): void {
        const startTime = performance.now();
        
        // Обновляем viewport если нужно
        if (this.needsViewportUpdate) {
            this.updateViewport();
            this.needsViewportUpdate = false;
        }
        
        // Выполняем culling (отсечение невидимых объектов)
        if (this.frustumCullingEnabled) {
            this.performFrustumCulling();
        }
        
        // Пересортировка если нужно
        if (this.needsResort && this.sortingEnabled) {
            this.performSorting();
            this.needsResort = false;
        }
        
        // Применяем LOD (Level of Detail)
        if (this.lodEnabled) {
            this.applyLOD();
        }
        
        // Обновляем статистику
        this.stats.renderTime = performance.now() - startTime;
    }
    
    private updateViewport(): void {
        const camera = this.camera;
        const screenBounds = this.app.screen;
        
        // Преобразуем углы экрана в мировые координаты
        const topLeft = camera.screenToWorld(0, 0);
        const topRight = camera.screenToWorld(screenBounds.width, 0);
        const bottomLeft = camera.screenToWorld(0, screenBounds.height);
        const bottomRight = camera.screenToWorld(screenBounds.width, screenBounds.height);
        
        // Находим границы viewport в мировых координатах
        this.viewport = {
            left: Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x) - 5,
            right: Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x) + 5,
            top: Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y) - 5,
            bottom: Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y) + 5
        };
    }
    
    private performFrustumCulling(): void {
        this.visibleObjects.clear();
        this.stats.visibleObjects = 0;
        this.stats.visibleSprites = 0;
        
        // Получаем объекты в области видимости
        const visibleObjects = this.spatialGrid.getObjectsInBounds(this.viewport);
        
        for (const object of visibleObjects) {
            const bounds = object.getBounds();
            
            // Проверяем пересечение с viewport
            if (this.boundsIntersect(bounds, this.viewport)) {
                this.visibleObjects.add(object.id);
                object.setVisible(true);
                this.stats.visibleObjects++;
                this.stats.visibleSprites += object.getAllSprites().length;
            } else {
                object.setVisible(false);
            }
        }
        
        // Скрываем объекты вне области видимости
        for (const [objectId, object] of this.objects) {
            if (!this.visibleObjects.has(objectId)) {
                object.setVisible(false);
            }
        }
    }
    
    private boundsIntersect(a: Rectangle, b: ViewportBounds): boolean {
        return !(a.x + a.width < b.left || 
                a.x > b.right || 
                a.y + a.height < b.top || 
                a.y > b.bottom);
    }
    
    private performSorting(): void {
        const startTime = performance.now();
        
        // Получаем только видимые объекты для сортировки
        const visibleObjectsList = Array.from(this.visibleObjects)
            .map(id => this.objects.get(id)!)
            .filter(obj => obj);
        
        if (visibleObjectsList.length === 0) {
            this.stats.sortTime = 0;
            return;
        }
        
        // Создаем новый сортировщик только для видимых объектов
        this.sorter = new IsometricObjectSorter(visibleObjectsList);
        this.sortedSprites = this.sorter.sortSprites();
        
        // Ограничиваем количество видимых спрайтов
        if (this.sortedSprites.length > this.maxVisibleSprites) {
            this.sortedSprites = this.sortedSprites.slice(0, this.maxVisibleSprites);
        }
        
        // Применяем z-индексы
        this.sortedSprites.forEach((sprite, index) => {
            sprite.pixiSprite.zIndex = index;
        });
        
        this.stats.sortTime = performance.now() - startTime;
    }
    
    private applyLOD(): void {
        const cameraDistance = this.camera.getZoom();
        
        for (const [objectId, object] of this.objects) {
            if (!this.visibleObjects.has(objectId)) continue;
            
            const sprites = object.getAllSprites();
            
            // Простая LOD система - скрываем детали на большом расстоянии
            sprites.forEach(sprite => {
                if (cameraDistance < 0.5) {
                    // Близко - показываем все детали
                    sprite.pixiSprite.visible = true;
                } else if (cameraDistance < 1.0) {
                    // Средне - скрываем мелкие детали
                    sprite.pixiSprite.visible = sprite.sortPriority >= 0;
                } else {
                    // Далеко - показываем только основные спрайты
                    sprite.pixiSprite.visible = sprite.sortPriority >= 1;
                }
            });
        }
    }
    
    // Методы камеры
    public getCamera(): IsometricCamera {
        return this.camera;
    }
    
    public setCameraPosition(x: number, y: number): void {
        this.camera.setPosition(x, y);
    }
    
    public setCameraZoom(zoom: number): void {
        this.camera.setZoom(zoom);
    }
    
    // Методы поиска объектов
    public getObjectsInArea(bounds: PIXIRectangle): IsometricObject[] {
        return this.spatialGrid.getObjectsInBounds(bounds);
    }
    
    public getObjectAt(worldX: number, worldY: number): IsometricObject | null {
        const objects = this.spatialGrid.getObjectsInBounds({
            left: worldX,
            right: worldX,
            top: worldY,
            bottom: worldY
        });
        
        // Возвращаем объект с наивысшим приоритетом
        return objects.reduce((highest, current) => {
            if (!highest) return current;
            
            const highestZ = highest.getZRange().max;
            const currentZ = current.getZRange().max;
            
            return currentZ > highestZ ? current : highest;
        }, null as IsometricObject | null);
    }
    
    // Настройки производительности
    public setMaxVisibleSprites(count: number): void {
        this.maxVisibleSprites = count;
    }
    
    public setSortingEnabled(enabled: boolean): void {
        this.sortingEnabled = enabled;
    }
    
    public setFrustumCullingEnabled(enabled: boolean): void {
        this.frustumCullingEnabled = enabled;
    }
    
    public setLODEnabled(enabled: boolean): void {
        this.lodEnabled = enabled;
    }
    
    // Принудительное обновление
    public forceResort(): void {
        this.needsResort = true;
    }
    
    public forceViewportUpdate(): void {
        this.needsViewportUpdate = true;
    }
    
    // Статистика
    public getStats(): RenderStats {
        this.stats.totalSprites = Array.from(this.objects.values())
            .reduce((total, obj) => total + obj.getAllSprites().length, 0);
        
        return { ...this.stats };
    }
    
    // Очистка
    public destroy(): void {
        this.app.ticker.remove(this.update, this);
        
        for (const object of this.objects.values()) {
            object.destroy();
        }
        
        this.objects.clear();
        this.spatialGrid.clear();
        this.worldContainer.destroy();
        // this.uiContainer.destroy();
    }
}
