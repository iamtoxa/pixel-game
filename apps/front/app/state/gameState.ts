import { GameApp } from "@/gameClasses/main";
import { makeAutoObservable } from "mobx"

class GameState {
    hotbar_active_slot = 1;
    inventory = [];

    gameApp: GameApp = new GameApp();

    constructor() {
        makeAutoObservable(this)
    }
}

export const gameState = new GameState()