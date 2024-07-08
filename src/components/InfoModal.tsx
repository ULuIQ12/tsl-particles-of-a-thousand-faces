import { useEffect, useState } from "react";
import LargeCollapsable from "./LargeCollapsable";
import { cameraIcon, closeCross, crosshairIcon, saveIcon, tools, uploadIcon } from "./GFX";

interface IInfoModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function InfoModal({
	isOpen,
	onClose,
}: IInfoModalProps) {

	const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

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
								has a lot of tweaking possibilities, with the maths, the physics, the shapes and the colors as well as intrincinc generative capabilities and
								its capacity to create life-like patterns.
								<br /><br />
								I managed to get a good result, and I wanted to share it to people that would enjoy playing with it, generative arts amateurs,
								and also to developers interested in the TSL.
								<br />
								TSL is still in development, and I think it has a lot of potential as a common webgl / webgpu interface for shaders, but as such,
								I can't guarantee that my code is the best way to use it. But it works.
								<br /><br />
								The code is focused on being readable and approachable, while producing beautiful images, so it's not the most optimized.
								My hope is that it will inspire people to look into the TSL if interested, but also try to implement their own version of the algorithm in whatever way they prefer.
							</div>
						</LargeCollapsable>
						<LargeCollapsable title="How it works" accordionName="info">
							<div className="flex flex-col gap-1">
								<div>This is particle system based on the asymetric interactions between different populations of particles.</div>
								<div>It's a simple physics simulation, where each particle has a <b>position</b>, a <b>velocity</b>, and a <b>type</b>, and each step of the simulation (or frame),
									each particle checks its distance to all the others, and if that distance is under a certain threshold,
									it applies a force to its velocity corresponding to both their types and that distance.
								</div>
								<div>Let's say you have two populations : red and blue. If red is attracted to blue, but blue is repelled by red, we get a pattern where red chases blue.</div>
								<div>We also establish that <b>under a certain distance, particles always try to repel each others</b>.</div>
								<div>Here, the relationships of one type to another is described in the interaction matrix, while the force over distance reaction is shown by the curve.</div>
								<div className="w-full flex flex-col text-center justify-center p-4 gap-2">
									<div className="flex m-auto w-half"><img src={"./assets/anotatedGraph_" + theme + ".svg"} /></div>
									<div className="flex m-auto text-sm ">The right part of the curve can go into the negative if the attraction factor is.</div>
								</div>
								<div>
									The bottom left part of the curve is the <b>separation force</b>, so it is negative and decreases to zero over the "separation distance" parameter.
									<br />
									Then, from "separation distance" to "attraction distance", the force will go from zero to the <b>value from attraction matrix</b> and back to zero again.
								</div>
								<div>
									When you combine the positions of the particles, the forces they apply to each other, and the physics parameters, you get a complex system that can produce a wide variety of patterns.
								</div>
							</div>
						</LargeCollapsable>
						<LargeCollapsable title="Controls" accordionName="info">
							<div className="flex flex-col gap-1">
								<div className="pb-2">
									<div className="font-bold"><i>General</i></div>
									<div>
										<li>Left click to interact with the particles.</li>
										<li>Right click pan the viewport.</li>
										<li>Scroll/Wheel to zoom.</li>
										<li><span className="inline-flex h-4 w-4 mx-1">{tools()}</span> button : Opens the configuration drawer</li>
										<li><b>?</b> button : Opens this popup</li>
										<li><span className="inline-flex h-4 w-4 mx-1">{cameraIcon()}</span> button : Takes a 4096x4096 pixels capture of the particles and saves it to a JPEG file.</li>
										<li><span className="inline-flex h-4 w-4 mx-1">{crosshairIcon()}</span> button : resets the camera</li>
										<li><span className="inline-flex h-4 w-4 mx-1">{saveIcon()}</span> button : saves you current paramters to a JSON file.</li>
										<li><span className="inline-flex h-4 w-4 mx-1">{uploadIcon()}</span> button : loads a previously saved JSON file.</li>
									</div>
								</div>
								<div className="pb-2">
									<div className="font-bold"><i>Configuration Presets</i></div>
									<div>
										This panel allows you to load a preset configuration from a selection. Choose one from the list then click the button.
									</div>
								</div>
								<div className="pb-2">
									<div className="font-bold">Physics parameters</div>
									<div>
										<li><span className="font-bold">Timescale : </span>How fast the simulation is running. You shouldn't really need to touch this one.
											Faster speeds makes the simulation less stable.</li>
										<li><span className="font-bold">Friction : </span>Resistance applied to motion. Use this to tune general speed.</li>
										<li><span className="font-bold">Max. force : </span>Maximum acceleration of the particles. Same as friction,
											use it to speed up or slow down the particles.</li>
										<li><span className="font-bold">Max. velocity : </span>Maximum speed of the particles. Note that as this is applied after Max. force,
											Max. force can't be greater than Max. velocity.</li>
										<li><span className="font-bold">Separation distance : </span>The left part of the curve, distance under which the particles will repel each other.</li>
										<li><span className="font-bold">Attraction distance : </span>The right part of the curve, distance under which the particles will apply the value from the attraction matrix.</li>
										<li><span className="font-bold">Separation force : </span>Relative importance of the separation force over total forces.</li>
										<li><span className="font-bold">Attraction force : </span>Relative importance of the attraction/repulsion force over total forces.</li>
										<li><span className="font-bold">Attraction attack : </span>Shape the beginning of the right part of the curve.</li>
										<li><span className="font-bold">Attraction decay : </span>Shape the end of the right part of the curve.</li>
										<li><span className="font-bold">Attraction gain : </span>Gain factor applied to the right part of the curve.</li>
										<li><span className="font-bold">Separation power : </span>The power factor applied to the left part of the curve.</li>
									</div>
								</div>
								<div className="pb-2">
									<div className="font-bold">Attraction/Repulsion rules</div>
									<div>
										<li><span className="font-bold">Number of types : </span>How many types, or populations of particles exists. Influence the size of the matrix.</li>
										<li><span className="font-bold">Attraction matrix : </span>
											The matrix of the interaction factors between the different types of particles, assiciated to their colors.
											A positive value (pink) means attraction, a negative value (blue) means repulsion.
											You can tune each individual value to create complex interactions by clicking and dragging left/right on each cell.
										</li>
										<li><span className="font-bold">Randomize weights : </span>Sets all the matrix cells to a random value between -1.0 and 1.0.</li>
										<li><span className="font-bold">Set weights to zero : </span>Set all the matrix cells to zero. Only the separation force will remain.</li>
										<li><span className="font-bold">Mirror top right to bottom left : </span>Mirrors to values to make all relations between groups symetric.</li>
										<li><span className="font-bold">Reponse type : </span>Select betweet various options to apply to direction between two particles over the distance that separates them.</li>
										<li><span className="font-bold">Apply noise to matrix : </span>Animates the values in the matrix by samplic the cells positions in a 2 octaves fractal noise.</li>
										<li><span className="font-bold">Noise time scale : </span>How fast the noise scrolls</li>
										<li><span className="font-bold">Noise frequency : </span>Frequency of the noise, how different are two cells close to each other.</li>
										<li><span className="font-bold">Noise amplitude : </span>Maximum value (positive or negative) applied.</li>
									</div>
								</div>
								<div className="pb-2">
									<div className="font-bold">Appearance</div>
									<div>
										<li><span className="font-bold">Palette : </span>A selection of predetermined colors, plus the option to define a custom palette, in which case
											color selector will appear allowing you to define each particle types colors as well a define the colors for the background and the frame of the simulation.</li>
										<li><span className="font-bold">Particle shape : </span>A selection of signed distance fields used to shape the particles.</li>
										<li><span className="font-bold">Part. size : </span>A scaling factor applied to the particles.</li>
										<li><span className="font-bold">Part. smoothness : </span>Smoothstep parameter applied to the signed distance field to make its boundary more or less defined.</li>
										<li><span className="font-bold">Velocity to size : </span>Scales the particles according to their velocity over the maximum velocity.</li>
										<li><span className="font-bold">Velocity to alpha : </span>Same thing, but for the opacity of the particle.</li>
										<li><span className="font-bold">Orient towards velocity : </span>Should to particles orient themselves along their velocity vector?</li>
										<li><span className="font-bold">Make shape anular : </span>Puts a hole in the shape.</li>
										<li><span className="font-bold">Additive blending : </span>How the colors blend.</li>
										<li><span className="font-bold">After image : </span>Applies a trailing effect to the whole canvas. Warning : GPU intensive.</li>
									</div>
								</div>
								<div className="pb-2">
									<div className="font-bold">Pointer interaction</div>
									<div>
										<li><span className="font-bold">Attraction factor : </span>
											How much the particles are attracted to the pointer. Can be negative, in which case they will be repelled.
										</li>
										<li><span className="font-bold">Strenght : </span>The strength of the pointer force.</li>
										<li><span className="font-bold">Range : </span>How far the particles are affected by the pointer.</li>
									</div>
								</div>
							</div>
						</LargeCollapsable>
						<LargeCollapsable title="Tips" accordionName="info">
							<div className="flex flex-col gap-1">
								<li>Go easy on the sliders, sometimes very small changes lead to big effects as all the factors are often in a tight balance.</li>
								<li>Use the "Randomize sliders" and "Randomize weights" button. You never know what result will appear. Find something you like that way
									and then fine tune the other sliders.</li>
								<li>To get a better understanding of the system, set the number of types to two, click "Set weights to zero",
									and then slowly change the values in the matrix while observing the result.</li>
								<li>The "Additive blending" and "After image" options mostly only work with dark backgrounds.</li>
								<li><span><a className="link" href="mailto:ulu@iq12.com">Send me</a></span> your favorite configuration! I might add it to the presets :) </li>
							</div>
						</LargeCollapsable>
						<LargeCollapsable title="Links" accordionName="info">
							<div className="flex flex-col gap-1">
								<li><a href="https://github.com/ULuIQ12/tsl-particles-of-a-thousand-faces" target="_blank" className="link">Github Repository</a> for this page.</li>
								<li><a href="https://vimeo.com/222974687" target="_blank" className="link">Jeffrey Ventrella explains "Clusters"</a> in video</li>
								<li><a href="https://www.youtube.com/watch?v=scvuli-zcRc" target="_blank" className="link">Video from Tom Mohr</a> about the math of the algorithm with some code examples.</li>
								<li><a href="https://iquilezles.org/articles/" target="_blank" className="link">Inigo Quilez articles</a>, pick a subject and learn.</li>
								<li><a href="https://threejs.org/" target="_blank" className="link">Three.js</a>, 3D for the web.</li>
								<li><a href="https://threejs.org/examples/?q=webgpu" target="_blank" className="link">Three.js webgpu examples</a>, many of them using nodes and or TSL.</li>
								<li><a href="https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language" target="_blank" className="link">Three.js TSL documentation.</a></li>
							</div>
						</LargeCollapsable>
						<LargeCollapsable title="Page stack" accordionName="info">
							<div className="flex flex-col gap-1">
								<li>Built with <a href="https://vitejs.dev/" target="_blank" className="link">Vite<img className="inline h-8 p-1 -mt-2" src="./assets/vite.svg" /></a></li>
								<li>Keeping it clean with <a href="https://www.typescriptlang.org/" target="_blank" className="link">TypeScript<img className="inline h-8 p-1 -mt-2" src="./assets/typescript.svg" /></a></li>
								<li>UI management with <a href="https://react.dev/" target="_blank" className="link">React<img className="inline h-8 p-1 -mt-2" src="./assets/react.svg" /></a></li>
								<li>UI components use <a href="https://tailwindcss.com/" target="_blank" className="link">Tailwind CSS<img className="inline h-8 w-8 p-1 -mt-2" src="./assets/tailwind.svg" /></a> and <a href="https://daisyui.com/" className="link">daisyUI<img className="inline h-8 w-8 p-1 -mt-2" src="./assets/daisy_ui.svg" /></a></li>
								<li>Some animations use <a href="https://gsap.com/" target="_blank" className="link">GSAP<img className="inline h-8 p-1 -mt-2" src="./assets/gsap.svg" /></a></li>
								<li>3D canvas with <a href="https://threejs.org/" target="_blank" className="link">Three.js<img className="inline h-8 p-1 -mt-2" src="./assets/three.svg" /></a></li>
								<li>Font is <a href="https://fonts.google.com/specimen/Rubik" target="_blank" className="link">Rubik<img className="inline h-8 p-1 -mt-2" src="./assets/googlefonts.svg" /></a></li>
								<li>Many icons picked from <a href="https://icons.getbootstrap.com/" target="_blank" className="link">Bootstrap icons<img className="inline h-8 p-1 -mt-2" src="./assets/bootstrap.svg" /></a></li>
							</div>
						</LargeCollapsable>
					</div>
				</div>
			</dialog>

		</>
	)
}