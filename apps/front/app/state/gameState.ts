import { makeAutoObservable } from "mobx"

class GameState {
    hotbar_active_slot = 1;
    inventory = [];

    constructor() {
        makeAutoObservable(this)
    }
}

export const gameState = new GameState()