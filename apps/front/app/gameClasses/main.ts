import { Application, TextureStyle } from "pixi.js";
import { registryInit } from "./Isometric/registry";

import { IsometricObject } from "./Isometric/Object";
import { IsometricScene } from "./Isometric/Scene";
import type { IsometricCamera } from "./Isometric/Camera";
import { GameController } from "./Controls/main";

export class GameApp {
  app!: Application;
  camera!: IsometricCamera;
  controller: GameController;

  constructor() {
    this.controller = new GameController(this);
  }

  setCanvasWrapper(wrapperEl: HTMLDivElement) {
    if(this.app) {
      return;
    }

    if (wrapperEl) {
      const app = new Application();

      TextureStyle.defaultOptions.scaleMode = 'nearest';

      this.app = app;
      app.init({ background: "#111", resizeTo: wrapperEl }).then(() => {
        wrapperEl.appendChild(app.canvas);

        this.app = app;
        this.initScene().then(() => {
          this.controller.bind();
        });
      });
    }
  }

  async initScene() {
    await registryInit();

    const scene = new IsometricScene(this.app, { width: 100, height: 100 });

    // Настраиваем производительность
    scene.setMaxVisibleSprites(500);
    scene.setSortingEnabled(true);
    scene.setFrustumCullingEnabled(true);
    scene.setLODEnabled(false);

    // Управление камерой
    this.camera = scene.getCamera();
    this.camera.setPosition(0, 0);
    this.camera.setZoom(2.0);



    for (let x = 0; x < 100; x++) {
      for (let y = 0; y < 100; y++) {
        const character = new IsometricObject(`box_${x}_${y}`, "box", {
          x: (x / 2) - 25,
          y: (y / 2) - 25,
          z: 0,
        });
        scene.addObject(character);
      }
    }

    // Отображение статистики
    setInterval(() => {
      const stats = scene.getStats();
      console.log(
        `Objects: ${stats.visibleObjects}/${stats.totalObjects}, Sprites: ${stats.visibleSprites}/${stats.totalSprites}, Sort: ${stats.sortTime.toFixed(2)}ms`
      );
    }, 1000);
  }
}
