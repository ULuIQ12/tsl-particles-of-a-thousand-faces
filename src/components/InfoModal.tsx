import { useEffect, useState } from "react";
import LargeCollapsable from "./LargeCollapsable";
import { closeCross } from "./GFX";

interface IInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InfoModal({
    isOpen,
    onClose,
}: IInfoModalProps) {

    const [theme, setTheme] = useState( localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        setTheme(localStorage.getItem('theme') || 'dark');
    }, [isOpen]);

    const handleOpenCloseChange = () => {
        onClose();
    }

    return (
        <>
            <dialog id="info-modal" className="modal">
                <div className="modal-box w-11/12 max-w-5xl">
                    <div className="font-bold text-lg pb-4 w-full flex row  items-center  max-h-[75vh] justify-between">
                        <div>Info / Help</div>
                        <button className="btn btn-neutral btn-circle drawer-button mb-2" onClick={handleOpenCloseChange}>{closeCross()}</button>
                    </div>
                    <div className="flex flex-col gap-2 justify-end">
                        <LargeCollapsable title="About" accordionName="info">
                            <div>
                                This page is an implementation of the "Clusters" algorithm by <a href="https://ventrella.com/" className="link">Jeffrey Ventrella</a>, using the Three Shading Language (TSL) in Three.js,
                                that I was looking into.
                                <br />
                                I wanted to experiment with the TSL, and this algorithm seemed like a good subject, as it's simple to implement and 
                                has a lot of tweaking possibilities, with the maths, the physics, the shapes and the colors as well as intrincinc generative capabilities.
                                <br /><br />
                                I managed to get a good result, and I wanted to share it to people that would enjoy playing with it, generative arts amateurs,
                                and also to developers interested in the TSL.
                                <br />
                                TSL is still in development, and I think it has a lot of potential as a common webgl / webgpu interface for shaders, but I such, 
                                I can't guarantee that my code is the best way to use it, but it works. 
                                <br />
                                The code is focused on being readable and approachable, while producing beautiful images, so it's not the most optimized. 
                                My hope is that it will inspire people to look into the TSL if interested, but also try to implement their own version of the algorithm in whatever way they prefer.
                            </div>
                        </LargeCollapsable>
                        <LargeCollapsable title="Controls" accordionName="info">
                            Controls !
                        </LargeCollapsable>
                        <LargeCollapsable title="How it works" accordionName="info">
                            <div className="flex flex-col gap-1">
                                <div>This is particle system based on asymetric interactions between different populations of particles.</div>
                                <div>It's a simple physics simulation, where each particle has a <b>position</b>, a <b>velocity</b>, and a <b>type</b>, and each step of the simulation (or frame), 
                                    each particle checks its distance to all the others, and if that distance is under a certain threshold, 
                                    it applies a force to its velocity corresponding to both their types and that distance.
                                </div>
                                <div>Let's say you have two populations : red and blue. If red is attracted to blue, but blue is repulsed by red, we get a pattern where red chases blue.</div>
                                <div>We also establish that under a certain distance, particles always repulse each others.</div>
                                <div>Here, the relationships of one type to another is described in the interaction matrix, while the force over distance reaction is shown by the curve.</div>
                                <div className="w-full flex flex-col justify-center p-4">
                                    <div className="flex m-auto w-half"><img  src={"./assets/anotatedGraph_" + theme + ".svg"}/></div>
                                </div>
                                <div>There are also some other forces that can be applied, like a gravity, a wind, or a noise, but they are not used in this implementation.</div>
                                <div>The particles are rendered as spheres, with a size and a smoothness that can be adjusted, and a color that can be set to a palette or to custom colors.</div>
                            </div>
                        </LargeCollapsable>
                        <LargeCollapsable title="Links" accordionName="info">
                            <div className="flex flex-col gap-1">
                                <li><a href="https://github.com/ULuIQ12/tsl-particles-of-a-thousand-faces" className="link">Github Repository</a> for this page.</li>
                                <li><a href="https://vimeo.com/222974687" className="link">Jeffrey Ventrella explains "Clusters"</a> in video</li>
                                <li><a href="https://www.youtube.com/watch?v=scvuli-zcRc" className="link">Video from Tom Mohr</a> about the math of the algorithm with some code examples.</li>
                                <li><a href="https://iquilezles.org/articles/" className="link">Inigo Quilez articles</a>, pick a subject and learn.</li>
                                <li><a href="https://threejs.org/" className="link">Three.js</a>, 3D for the web.</li>
                                <li><a href="https://threejs.org/examples/?q=webgpu" className="link">Three.js webgpu examples</a>, many of them using nodes and or TSL.</li>
                                <li><a href="https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language" className="link">Three.js TSL documentation.</a></li>
                            </div>
                        </LargeCollapsable>
                        <LargeCollapsable title="Page stack" accordionName="info">
                            <div className="flex flex-col gap-1">
                                <li>Built with <a href="https://vitejs.dev/" className="link">Vite<img className="inline h-8 p-1 -mt-2" src="./assets/vite.svg"/></a></li>
                                <li>Keeping it clean with <a href="https://www.typescriptlang.org/" className="link">TypeScript<img className="inline h-8 p-1 -mt-2" src="./assets/typescript.svg"/></a></li>
                                <li>UI management with <a href="https://react.dev/" className="link">React<img className="inline h-8 p-1 -mt-2" src="./assets/react.svg"/></a></li>
                                <li>UI components use <a href="https://tailwindcss.com/" className="link">Tailwind CSS<img className="inline h-8 w-8 p-1 -mt-2" src="./assets/tailwind.svg"/></a> and <a href="https://daisyui.com/" className="link">daisyUI<img className="inline h-8 w-8 p-1 -mt-2" src="./assets/daisy_ui.svg"/></a></li>
                                <li>Some animations use <a href="https://gsap.com/" className="link">GSAP<img className="inline h-8 p-1 -mt-2" src="./assets/gsap.svg"/></a></li>
                                <li>3D canvas with <a href="https://threejs.org/" className="link">Three.js<img className="inline h-8 p-1 -mt-2" src="./assets/three.svg"/></a></li>
                                <li>Font is <a href="https://fonts.google.com/specimen/Rubik" className="link">Rubik<img className="inline h-8 p-1 -mt-2" src="./assets/googlefonts.svg"/></a></li>
                                <li>Many icons picked from <a href="https://icons.getbootstrap.com/" className="link">Bootstrap icons<img className="inline h-8 p-1 -mt-2" src="./assets/bootstrap.svg"/></a></li>
                            </div>
                        </LargeCollapsable>
                    </div>
                </div>
            </dialog>

        </>
    )
}