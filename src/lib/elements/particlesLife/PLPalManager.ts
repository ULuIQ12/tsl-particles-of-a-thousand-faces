import { Palettes, PLPalette } from "./PLPalette";

export class PLPalManager {
    public static instance: PLPalManager;
    static _current: PLPalette = new PLPalette(Palettes.DefaultLight);

    static get current(): PLPalette {
        if (PLPalManager.instance == null) {
            new PLPalManager();
        }
        return PLPalManager._current;
    }

    static set current(p: PLPalette) {
        PLPalManager._current = p;
    }

    constructor() {
        if (PLPalManager.instance != null) {
            console.warn("PLPalManager instance already exists");
            return;
        }
        PLPalManager.instance = this;
    }
}