import type { IsometricCamera } from "../Isometric/Camera";

export class IsometricCameraController {
    private camera: IsometricCamera;
    private targetZoom: number;
    private currentZoom: number;
    private targetPosition: { x: number; y: number };
    private currentPosition: { x: number; y: number };
    
    private zoomSpeed: number = 0.1;
    private baseMoveSpeed: number = 0.5;
    private minZoom: number = 1.0;
    private maxZoom: number = 3.0;
    private lerpFactor: number = 0.15;
    
    private keys: Set<string> = new Set();

    constructor(camera: IsometricCamera) {
        this.camera = camera;
        this.currentZoom = camera.getZoom();
        this.targetZoom = this.currentZoom;
        
        const pos = camera.getPosition();
        this.currentPosition = { x: pos.x, y: pos.y };
        this.targetPosition = { x: pos.x, y: pos.y };
        
        this.setupEventListeners();
        this.startUpdateLoop();
    }

    private setupEventListeners(): void {
        // Колесико мыши для зума
        window.addEventListener('wheel', (event: WheelEvent) => {
            event.preventDefault();
            const zoomDelta = event.deltaY > 0 ? -this.zoomSpeed : this.zoomSpeed;
            this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom + zoomDelta));
        }, { passive: false });

        // Клавиатура для перемещения
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            this.keys.add(event.code.toLowerCase());
        });

        window.addEventListener('keyup', (event: KeyboardEvent) => {
            this.keys.delete(event.code.toLowerCase());
        });
    }

    private getMoveSpeed(): number {
        // Чем больше зум (приближение), тем меньше скорость
        return this.baseMoveSpeed / this.currentZoom;
    }

    private updateMovement(): void {
        let deltaX = 0;
        let deltaY = 0;

        // W/S - движение по изометрической оси Y (вверх-вниз по экрану)
        if (this.keys.has('keyw')) {
            deltaX -= 0.5;
            deltaY -= 0.5;
        }
        if (this.keys.has('keys')) {
            deltaX += 0.5;
            deltaY += 0.5;
        }
        
        // A/D - движение по изометрической оси X (влево-вправо по экрану)
        if (this.keys.has('keya')) {
            deltaX -= 0.5;
            deltaY += 0.5;
        }
        if (this.keys.has('keyd')) {
            deltaX += 0.5;
            deltaY -= 0.5;
        }

        // Нормализуем вектор движения и применяем скорость с учетом зума
        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (length > 0) {
            const moveSpeed = this.getMoveSpeed();
            deltaX = (deltaX / length) * moveSpeed;
            deltaY = (deltaY / length) * moveSpeed;
            
            this.targetPosition.x += deltaX;
            this.targetPosition.y += deltaY;
        }
    }

    private startUpdateLoop(): void {
        const update = () => {
            // Обновляем целевую позицию на основе нажатых клавиш
            this.updateMovement();
            
            // Плавная интерполяция позиции
            this.currentPosition.x += (this.targetPosition.x - this.currentPosition.x) * this.lerpFactor;
            this.currentPosition.y += (this.targetPosition.y - this.currentPosition.y) * this.lerpFactor;
            
            // Плавная интерполяция зума
            this.currentZoom += (this.targetZoom - this.currentZoom) * this.lerpFactor;
            
            // Применяем изменения если есть разница
            if (Math.abs(this.targetPosition.x - this.currentPosition.x) > 0.01 || 
                Math.abs(this.targetPosition.y - this.currentPosition.y) > 0.01) {
                this.camera.setPosition(this.currentPosition.x, this.currentPosition.y);
            }
            
            if (Math.abs(this.targetZoom - this.currentZoom) > 0.001) {
                this.camera.setZoom(this.currentZoom);
            }
            
            requestAnimationFrame(update);
        };
        
        update();
    }
}