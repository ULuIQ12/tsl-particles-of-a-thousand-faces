import { Clock, PerspectiveCamera, Scene, Vector2, Vector3 } from "three";
import { OrbitControls, TrackballControls } from "three/examples/jsm/Addons.js";
import WebGPU from "three/examples/jsm/capabilities/WebGPU.js";
import PostProcessing from "three/examples/jsm/renderers/common/PostProcessing.js";
import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer.js";
import { cond, pass, uniform } from "three/examples/jsm/nodes/Nodes.js";

import { IAnimatedElement } from "./interfaces/IAnimatedElement";
import { ParticlesLife } from "./elements/ParticlesLife";


export class Root {

    static instance: Root;
    animatedElements: IAnimatedElement[] = [];
    static registerAnimatedElement(element: IAnimatedElement) {
        if (Root.instance == null) {
            throw new Error("Root instance not found");
        }
        if (Root.instance.animatedElements.indexOf(element) == -1) {
            Root.instance.animatedElements.push(element);
        }
    }

    canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {

        this.canvas = canvas;

        if (Root.instance != null) {
            console.warn("Root instance already exists");
            return;
        }
        Root.instance = this;
    }

    async init() {
        this.initRenderer();
        this.initCamera();
        this.initScene();
        this.initPost();

        this.clock.start();
        this.renderer!.setAnimationLoop(this.animate.bind(this));

        return new Promise<void>((resolve) => {
            resolve();
        });
    }

    renderer?: WebGPURenderer;
    clock: Clock = new Clock(false);
    post?: PostProcessing;
    initRenderer() {
        
        if (WebGPU.isAvailable() === false) { // doesn't work with WebGL2
            throw new Error('No WebGPU support');
        }

        this.renderer = new WebGPURenderer({ canvas: this.canvas, antialias: true });
        console.log("Renderer :", this.renderer);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        window.addEventListener('resize', this.onResize.bind(this));
    }

    camera: PerspectiveCamera = new PerspectiveCamera(70, 1, .1, 200);
    controls?: OrbitControls | TrackballControls;
    initCamera() {
        const aspect: number = window.innerWidth / window.innerHeight;
        this.camera.aspect = aspect;
        this.camera.position.z = 10;
        this.camera.updateProjectionMatrix();
        this.controls = new TrackballControls(this.camera, this.canvas);
        this.controls.target.set(0, 0, 0);
    }

    scene: Scene = new Scene();
    initScene() {
        new ParticlesLife(this.scene, this.camera, this.controls! as TrackballControls, this.renderer!);
    }

    postProcessing?: PostProcessing;
    afterImagePass ;
    scenePass ;
    uUseAfterImage = uniform(0);
    static setUseAfterImage( value:boolean ) {
        if( Root.instance == null ) {
            throw new Error("Root instance not found");
        }
        Root.instance.uUseAfterImage.value = value ? 1 : 0;
    }
    initPost() {

        this.scenePass = pass(this.scene, this.camera);
        const scenePassColor = this.scenePass.getTextureNode();
        this.afterImagePass = scenePassColor;
        this.afterImagePass = this.afterImagePass.afterImage( 0.9 );

        this.postProcessing = new PostProcessing(this.renderer!);
        //this.postProcessing.outputNode = scenePass;
        this.postProcessing.outputNode = cond( this.uUseAfterImage.lessThan(1), this.scenePass, this.afterImagePass);
    }

    onResize( event, toSize?:Vector2 ) {
        const size:Vector2 = new Vector2(window.innerWidth, window.innerHeight);
        if(toSize) size.copy(toSize);

        this.camera.aspect = size.x / size.y;
        this.camera.updateProjectionMatrix();
        this.renderer!.setPixelRatio(window.devicePixelRatio);
        this.renderer!.setSize(size.x, size.y);
        this.renderer!.domElement.style.width = `${size.x}px`;
        this.renderer!.domElement.style.height = `${size.y}px`;
    }

    animate() {
        if (!this.capturing) {
            const dt: number = this.clock.getDelta();
            const elapsed: number = this.clock.getElapsedTime();
            this.controls!.update();
            this.animatedElements.forEach((element) => {
                element.update(dt, elapsed);
            });
            this.postProcessing!.render();
        }
    }

    static StartCapture(): void {
        if (Root.instance == null) {
            throw new Error("Root instance not found");
        }
        if( Root.instance.capturing ) {
            console.log( "Already capturing")
            return;
        }
        
        (async () => {
            await Root.instance.capture();
            console.log( "Capture done");
        })();

    }

    capturing: boolean = false;
    savedPosition:Vector3 = new Vector3();
    async capture() {
        try {
            this.capturing = true;
            const resolution:Vector2 = new Vector2(4096,4096);
            this.savedPosition.copy(this.camera.position);
            this.camera.position.set(0, 0, 100);
            this.camera.lookAt(0, 0, 0);
            this.camera.updateMatrixWorld(true);
            this.controls.target.set(0, 0, 0);
            this.onResize(null, resolution);
            ParticlesLife.showHideCurve(false);

            await new Promise(resolve => setTimeout(resolve, 20));
            await this.postProcessing!.renderAsync();
            
            const strMime = "image/jpeg";
            const imgData = this.renderer.domElement.toDataURL(strMime, 1.0);
            const strDownloadMime: string = "image/octet-stream";
            const filename: string = `particles_${(Date.now())}.jpg`

            await this.saveFile(imgData.replace(strMime, strDownloadMime), filename);

        } catch (e) {
            console.log(e);
            return;
        }

    }

    async saveFile(strData, filename) {
        const link = document.createElement('a');
        if (typeof link.download === 'string') {
            this.renderer.domElement.appendChild(link);
            link.download = filename;
            link.href = strData;
            link.click();
            this.renderer.domElement.removeChild(link);
        } else {
            //
        }
        await new Promise(resolve => setTimeout(resolve, 10));
        this.camera.position.copy(this.savedPosition);
        this.controls.target.set(this.savedPosition.x, this.savedPosition.y, 0);
        this.onResize(null);
        ParticlesLife.showHideCurve(true);
        this.capturing = false;
    }
} 