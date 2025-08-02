import { Container, EventEmitter } from "pixi.js";
import { IsometricObject } from "./Object";
import type { WorldPosition } from "./interfaces";

// Камера для изометрической проекции
export class IsometricCamera extends EventEmitter {
    private container: Container;
    private _x: number = 0;
    private _y: number = 0;
    private _zoom: number = 1;
    
    constructor(container: Container) {
        super();
        this.container = container;
    }
    
    public setPosition(x: number, y: number): void {
        this._x = x;
        this._y = y;
        this.updateTransform();
        this.emit('moved');
    }
    
    public setZoom(zoom: number): void {
        this._zoom = Math.max(0.1, Math.min(5.0, zoom));
        this.updateTransform();
        this.emit('moved');
    }
    
    public getPosition(): { x: number; y: number } {
        return { x: this._x, y: this._y };
    }
    
    public getZoom(): number {
        return this._zoom;
    }
    
    private updateTransform(): void {
        const screenPos = this.worldToScreen(this._x, this._y);
        
        this.container.scale.set(this._zoom);
        this.container.position.set(
            -screenPos.x * this._zoom + window.innerWidth / 2,
            -screenPos.y * this._zoom + window.innerHeight / 2
        );
    }
    
    public worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
        return IsometricObject.prototype.worldToScreen.call(null, worldX, worldY, 0);
    }
    
    public screenToWorld(screenX: number, screenY: number): WorldPosition {
        // Учитываем трансформации камеры
        const adjustedX = (screenX - window.innerWidth / 2) / this._zoom + this.worldToScreen(this._x, this._y).x;
        const adjustedY = (screenY - window.innerHeight / 2) / this._zoom + this.worldToScreen(this._x, this._y).y;
        
        return IsometricObject.prototype.screenToWorld.call(null, adjustedX, adjustedY, 0);
    }
}

