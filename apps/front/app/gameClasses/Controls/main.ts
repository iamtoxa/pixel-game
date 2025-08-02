import type { GameApp } from "../main";
import { IsometricCameraController } from "./camera";

export class GameController {
    constructor(private readonly game: GameApp) {

    }

    bind() {
        const cameraZoom = new IsometricCameraController(this.game.camera);
    }

    unbind() {

    }
}