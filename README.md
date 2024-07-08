# Particles of a Thousand faces

![Particles of a Thousand faces](./readme/collage.jpg "Particles of a Thousand faces")

Welcome to "Particles of a Thousand Faces" - a particle simulation designed to test and experiment with the Three Shading Language. I always found this algorithm to be fast and fun to implement, with plenty of tinkering potiential. It's also quite pleasing to look at.
This repo is adressed to three.js enthousiasts curious about TSL, but also to creative coders who may not know about this particular algorithm.

## Website 

Visit https://ulucode.com/random/webgputests/particles/ to play!
Requires a browser with WebGPU support.

## TSL 
Most of the important code, regarding TSL and the implementation of the algorithm is in [/src/lib/elements/ParticlesLife.ts](https://github.com/ULuIQ12/tsl-particles-of-a-thousand-faces/blob/main/src/lib/elements/ParticlesLife.ts)
The file is heavily commented and uses descriptive variable names.
It is partially typed, but don't worry if you know nothing about Typescript : you can safely ignore it (although I would encourage you to look into it).

## Disclaimer
This is very experimental : I haven't looked under the hood at how TSL works, I'm just going from the examples provided by three.js and their documentation. 
I can't guarantee that I'm following good TSL practices is such a thing exists. My goal was to produce a fun toy, with an artistic flavor.

## Features

- **TSL and WebGPU**: Takes advantage of Three Shading Language (TSL) and WebGPU, with vertex, fragment and compute shaders all in Javascript, no WGSL involved for the end user.
- **Interactive Simulation**: Plenty of buttons and sliders to play with, as well cursor interactions.
- **Configuration import/export**: save/load configuration to JSON.
- **Capture**: Capture still frames of your creation.


## Getting Started

To start the development environment for this project, follow these steps:

1. Clone the repository to your local machine:

  ```bash
  git clone https://github.com/ULuIQ12/tsl-particles-of-a-thousand-faces.git
  ```

2. Navigate to the project directory:

  ```bash
  cd tsl-particles-of-a-thousand-faces
  ```

3. Install the dependencies:

  ```bash
  npm install
  ```

4. Start the development server:

  ```bash
  npm run dev
  ```

  This will start the development server and open the project in your default browser.

## Building the Project

1. Edit the base path in vite.config.ts

2. To build the project for production, run the following command:

```bash
npm run build
```

This will create an optimized build of the project in the `dist` directory.


## Acknowledgements
- Algorithm based on Clusters by Jeffrey Ventrella https://www.ventrella.com/Clusters/
- Uses Three.js https://threejs.org/
- Built with Vite https://vitejs.dev/
- UI Management uses React https://react.dev/
- UI components use TailwindCSS https://tailwindcss.com/ and daisyUI https://daisyui.com/
- SDF functions and other utilities from Inigo Quilez https://iquilezles.org/
- Uses GSAP https://gsap.com/
- Font is Rubik https://fonts.google.com/specimen/Rubik , license in /src/assets/fonts/

## Resources 
- Three.js WebGPU examples : https://threejs.org/examples/?q=webgpu
- Three.js TSL documentation : https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language
- Jeffrey Ventrella explains "Clusters" in video : https://vimeo.com/222974687
- Video from Tom Mohr about the math of the algorithm with some code examples : https://www.youtube.com/watch?v=scvuli-zcRc


   