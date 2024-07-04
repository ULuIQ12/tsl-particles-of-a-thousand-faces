export enum Palettes {
    DefaultLight = "DefaultLight",
    DefaultDark = "DefaultDark",
    RainbowLight = "RainbowLight",
    RainbowDark = "RainbowDark",
    GreyLight = "GreyLight",
    GreyDark = "GreyDark",
    BlueYellow = "BlueYellow",
    BlueGradient = "BlueGradient",
    DarkPink = "DarkPink",
    BlueRedDark = "BlueRedDark",
    BlueRedLight = "BlueRedLight",
    
    // https://studioyorktown.github.io/coloryorktownhall/
    // Bruce is a great artist, check out his work https://www.studioyorktown.com/
    YorktownBregenz = "YorktownBregenz",
    YorktownTutti = "YorktownTutti",
    YorktownShibuya = "YorktownShibuya",
}

export class PLPalette {

    particlesColors: number[] = [];
    backgroundColor: number;
    frameColor: number;
    constructor(p: Palettes = Palettes.DefaultLight) {

        const paletteInitializers = new Map([
            [Palettes.DefaultLight, this.initDefault],
            [Palettes.DefaultDark, this.initDark],
            [Palettes.RainbowLight, this.initRainbowLight],
            [Palettes.RainbowDark, this.initRainbowDark],
            [Palettes.GreyLight, this.initGreyLight],
            [Palettes.GreyDark, this.initGreyDark],
            [Palettes.BlueYellow, this.initBlueYellow],
            [Palettes.BlueGradient, this.initBlueGradient],
            [Palettes.DarkPink, this.initDarkPink],
            [Palettes.BlueRedDark, this.initBlueRedDark],
            [Palettes.BlueRedLight, this.initBlueRedLight],
            [Palettes.YorktownBregenz, this.initYorktownBregenz],
            [Palettes.YorktownTutti, this.initYorktownTutti],
            [Palettes.YorktownShibuya, this.initYorktownShibuya],
        ]);
        const initializer = paletteInitializers.get(p);
        if (initializer) {
            initializer.call(this);
        } else {
            this.initDefault();
        }
    }

    initDefault(): PLPalette {
        this.particlesColors = [
            0xff1f70,
            0x3286ff,
            0xffba03,
            0xff6202,
            0x874af3,
            0x14b2a1,
            0x3a5098,
            0xf53325,
        ];
        this.backgroundColor = 0xecebdb;
        this.frameColor = 0x191e24;
        return this;
    }

    initDark(): PLPalette {
        this.particlesColors = [
            0xff1f70,
            0x3286ff,
            0xffba03,
            0xff6202,
            0x874af3,
            0x14b2a1,
            0x3a5098,
            0xf53325,
        ];
        this.backgroundColor = 0x0c0e11;
        this.frameColor = 0xa6adbb;
        return this;
    }

    initRainbowLight(): PLPalette {
        this.particlesColors = [
            0x448aff,
            0x1565c0,
            0x009688,
            0x8bc34a,
            0xffc107,
            0xff9800,
            0xf44336,
            0xad1457,
        ];
        this.backgroundColor = 0xecebdb;
        this.frameColor = 0x191e24;
        return this;
    }

    initRainbowDark(): PLPalette {
        this.particlesColors = [
            0x448aff,
            0x1565c0,
            0x009688,
            0x8bc34a,
            0xffc107,
            0xff9800,
            0xf44336,
            0xad1457,
        ];
        this.backgroundColor = 0x0c0e11;
        this.frameColor = 0xa6adbb;
        return this;
    }

    initGreyLight(): PLPalette {
        this.particlesColors = [
            0xcccccc,
            0xb3b3b3,
            0x999999,
            0x808080,
            0x666666,
            0x4d4d4d,
            0x333333,
            0x1a1a1a,
        ];
        this.backgroundColor = 0xffffff;
        this.frameColor = 0x000000;
        return this;
    }

    initGreyDark(): PLPalette {
        this.particlesColors = [
            0xcccccc,
            0xb3b3b3,
            0x999999,
            0x808080,
            0x666666,
            0x4d4d4d,
            0x333333,
            0x1a1a1a,
        ];
        this.backgroundColor = 0x000000;
        this.frameColor = 0xffffff;
        return this;
    }

    initBlueYellow(): PLPalette {
        this.particlesColors = [
            0x126782,
            0xffbe1a,
            0x0a4c65,
            0xffb703,
            0x063e56,
            0xffbe1a,
            0x023047,
            0xfb9017,
        ];
        this.backgroundColor = 0xecebdb;
        this.frameColor = 0x191e24;
        return this;
    }

    initBlueGradient(): PLPalette {
        this.particlesColors = [
            0x77b6cf,
            0x45a0c4,
            0x2389ad,
            0x017296,
            0x025f80,
            0x09516c,
            0x0f4357,
            0x16313b,
        ];
        this.backgroundColor = 0xecebdb;
        this.frameColor = 0x191e24;
        return this;
    }

    initDarkPink(): PLPalette {
        this.particlesColors = [
            0xfe006c,
            0x550f29,
            0xf00166,
            0x640e2f,
            0xd2045a,
            0x7d0c38,
            0xbe0652,
            0x9e0945,
        ];
        this.backgroundColor = 0x0c0e11;
        this.frameColor = 0xa6adbb;
        return this;
    }

    initBlueRedDark(): PLPalette {
        this.particlesColors = [
            0x005f73,
            0xae2012,
            0x0a9396,
            0xbb3e03,
            0x94d2bd,
            0xca6702,
            0xe9d8a6,
            0xee9b00,
        ];
        this.backgroundColor = 0x001219;
        this.frameColor = 0xe9d8a6;
        return this;
    }

    initBlueRedLight(): PLPalette {
        this.particlesColors = [
            0x001219,
            0x9b2226,
            0x005f73,
            0xae2012,
            0x0a9396,
            0xbb3e03,
            0xee9b00,
            0xca6702,
        ];
        this.backgroundColor = 0xe9d8a6;
        this.frameColor = 0x001219;
        return this;
    }

    initYorktownBregenz(): PLPalette {
        this.particlesColors = [
            0xf9f0de,
            0x8e8780,
            0xfab515,
            0xd7312e,
            0x2a71af,
            0xad7347,
            0x1d1d1b,
            0xc4b8ad,
        ];
        this.backgroundColor = 0xece3d0;
        this.frameColor = 0x1d1d1b;
        return this;
    }

    initYorktownTutti(): PLPalette {
        this.particlesColors = [
            0xd7312e,
            0xf9f0de,
            0xf0ac00,
            0x0c7e45,
            0x2c52a0,
            0xf7bab6,
            0x5ec5ee,
            0xece3d0,
        ];
        this.backgroundColor = 0x1d1d1b;
        this.frameColor = 0xc4b8ad;
        return this;
    }

    initYorktownShibuya(): PLPalette {
        this.particlesColors = [
            0x1d1d1b,
            0xffd200,
            0xd2b0a3,
            0xe51f23,
            0xe6007b,
            0x005aa7,
            0x5ec5ee,
            0xf9f0de,
        ];
        this.backgroundColor = 0xece3d0;
        this.frameColor = 0x1d1d1b;
        return this;
    }

}