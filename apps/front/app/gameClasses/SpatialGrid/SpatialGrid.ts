import type { ViewportBounds, WorldPosition } from "../Isometric/interfaces";
import type { IsometricObject } from "../Isometric/Object";

// Пространственная сетка для оптимизации поиска
export class SpatialGrid {
    private grid: Map<string, Set<IsometricObject>> = new Map();
    private objectCells: Map<string, Set<string>> = new Map();
    
    constructor(
        private width: number,
        private height: number,
        private cellSize: number
    ) {}
    
    private getCellKey(x: number, y: number): string {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }
    
    private getObjectCells(object: IsometricObject): string[] {
        const bounds = object.getBounds();
        const cells: string[] = [];
        
        const startX = Math.floor(bounds.x / this.cellSize);
        const endX = Math.floor((bounds.x + bounds.width) / this.cellSize);
        const startY = Math.floor(bounds.y / this.cellSize);
        const endY = Math.floor((bounds.y + bounds.height) / this.cellSize);
        
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                cells.push(`${x},${y}`);
            }
        }
        
        return cells;
    }
    
    public addObject(object: IsometricObject): void {
        const cells = this.getObjectCells(object);
        this.objectCells.set(object.id, new Set(cells));
        
        for (const cellKey of cells) {
            if (!this.grid.has(cellKey)) {
                this.grid.set(cellKey, new Set());
            }
            this.grid.get(cellKey)!.add(object);
        }
    }
    
    public removeObject(object: IsometricObject): void {
        const cells = this.objectCells.get(object.id);
        if (!cells) return;
        
        for (const cellKey of cells) {
            const cell = this.grid.get(cellKey);
            if (cell) {
                cell.delete(object);
                if (cell.size === 0) {
                    this.grid.delete(cellKey);
                }
            }
        }
        
        this.objectCells.delete(object.id);
    }
    
    public updateObject(object: IsometricObject, newPosition: WorldPosition): void {
        this.removeObject(object);
        object.setWorldPosition(newPosition);
        this.addObject(object);
    }
    
    public getObjectsInBounds(bounds: ViewportBounds): IsometricObject[] {
        const objects = new Set<IsometricObject>();
        
        const startX = Math.floor(bounds.left / this.cellSize);
        const endX = Math.floor(bounds.right / this.cellSize);
        const startY = Math.floor(bounds.top / this.cellSize);
        const endY = Math.floor(bounds.bottom / this.cellSize);
        
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                const cellKey = `${x},${y}`;
                const cell = this.grid.get(cellKey);
                if (cell) {
                    cell.forEach(obj => objects.add(obj));
                }
            }
        }
        
        return Array.from(objects);
    }
    
    public clear(): void {
        this.grid.clear();
        this.objectCells.clear();
    }
}
