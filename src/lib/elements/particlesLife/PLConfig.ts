import { Palettes } from "./PLPalette";

// data to be serialized, and accessed from a singleton
export default class PLConfig {
    physics: PLPhysicsConfig = new PLPhysicsConfig();
    attraction: PLAttractionConfig = new PLAttractionConfig();
    appearance: PLAppearanceConfig = new PLAppearanceConfig();
    pointer: PLPointerConfig = new PLPointerConfig();

    static get(): PLConfig {
        if (PLConfig.instance == null) {
            PLConfig.instance = new PLConfig();
        }
        return PLConfig.instance;
    }

    static set(config: PLConfig) {
        PLConfig.instance = config;
    }

    private static instance: PLConfig;
    constructor() {
        if (PLConfig.instance != null) {
            return;
        }
        PLConfig.instance = this;
    }
}

export class PLPhysicsConfig {
    timeScale: number = 1.0;
    friction: number = 0.25;
    maxForce: number = 0.5;
    maxVelocity: number = 0.5;
    separationDistance: number = 1.0;
    attractionDistance: number = 5.0;
    separationForce: number = 0.5;
    attractionForce: number = 0.5;
    attractionAttack: number = 1.0;
    attractionDecay: number = 1.0;
    attractionGain: number = 1.0;
    separationPower: number = 1.0;
}

export class PLAttractionConfig {
    nbTypes: number = 4;
    values: number[] = Array.from({ length: 64 }, () => Math.random() * 2 - 1);
    response: number = 0.0;
    useNoise: boolean = false;
    noiseTimeScale: number = 1.0;
    noiseFrequency: number = 0.5;
    noiseAmplitude: number = 0.5;
}

export class PLAppearanceConfig {
    palette: string = Palettes.DefaultLight;
    shape: number = 0;
    particleSize: number = 0.1;
    particleSmoothness: number = 0.1;
    velToSize: boolean = false;
    velToAlpha: boolean = false;
    orientToVel: boolean = true;
    makeAnular: boolean = false;
    additive:boolean = false;
    customColors: number[] = [0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000];
    customBackgroundColor:number = 0xffffff;
    customFrameColor:number = 0x000000;
    afterImage: boolean = false;
}

export class PLPointerConfig {
    attraction:number = 0.5;
    strength: number = 3.0;
    range: number = 16.0;
}