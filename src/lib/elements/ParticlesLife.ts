
// @ts-nocheck
// cutting the Typescript linting for this file, as it seems a bit too strict for the TSL code
import WebGPURenderer from "three/examples/jsm/renderers/webgpu/WebGPURenderer.js";
import { AdditiveBlending, BufferGeometry, Color, Group, InstancedMesh, MathUtils, Mesh, NormalBlending, PerspectiveCamera, Plane, PlaneGeometry, Raycaster, Scene, Vector2, Vector3 } from "three";
import { TrackballControls } from "three/examples/jsm/Addons.js";
import { loop, color, float, If, instanceIndex, length, smoothstep, SpriteNodeMaterial, storage, tslFn, uv, vec2, abs, timerDelta, min, pow, sub, normalize, vec4, uniform, clamp, cond, mul, int, EPSILON, lengthSq, max, MeshBasicNodeMaterial, positionWorld, atan2, PI, cos, sin, mix, uniforms, storageObject, timerGlobal } from "three/examples/jsm/nodes/Nodes.js";
import StorageInstancedBufferAttribute from "three/examples/jsm/renderers/common/StorageInstancedBufferAttribute.js";
import FastSimplexNoise from "@webvoxel/fast-simplex-noise";
import gsap from "gsap";

import { IAnimatedElement } from "../interfaces/IAnimatedElement";
import { Root } from "../Root";
import { sdBox, sdCircle, sdCross, sdHexagon, sdMoon, sdRoundedBox, sdRoundedX } from "../nodes/DistanceFunctions";
import PLConfig from "./particlesLife/PLConfig";
import { PLPalManager } from "./particlesLife/PLPalManager";
import { Palettes, PLPalette } from "./particlesLife/PLPalette";
import { setExtMatrixData } from "../../App";


/**
 * TSL implementation of particle life, a simple particle system with attraction and repulsion forces
 */
export class ParticlesLife implements IAnimatedElement {

	static instance: ParticlesLife; // dirty access for react components

	scene: Scene;
	camera: PerspectiveCamera;
	renderer: WebGPURenderer;
	controls: TrackballControls;
	particleMat: SpriteNodeMaterial;

	maxTypes = 8; 
	maxTypesSq = this.maxTypes * this.maxTypes;
	particleCount = Math.pow(2, 14); // 16384 , can't really go higher on my machine without some performance issues ( 1080 GTX 8GB )

	computeInit; // TSL initialization node
	computeParticles; // main TSL update node
	typeColorsBuffer; // contains the current palette colors. I suppose this also could stored in uniforms, it's not that long

	// uniforms
	nbTypes = uniform(PLConfig.get().attraction.nbTypes);
	timeScale = uniform(PLConfig.get().physics.timeScale);
	uAttractorType = uniform(PLConfig.get().attraction.response);
	friction = uniform(PLConfig.get().physics.friction);
	separationDistance = uniform(PLConfig.get().physics.separationDistance);
	attractionDistance = uniform(PLConfig.get().physics.attractionDistance);
	maxForce = uniform(PLConfig.get().physics.maxForce);
	maxVelocity = uniform(PLConfig.get().physics.maxVelocity);
	separationForce = uniform(PLConfig.get().physics.separationForce);
	attractionForce = uniform(PLConfig.get().physics.attractionForce);
	attractionAttack = uniform(PLConfig.get().physics.attractionAttack);
	attractionDecay = uniform(PLConfig.get().physics.attractionDecay);
	attractionGain = uniform(PLConfig.get().physics.attractionGain);
	separationPower = uniform(PLConfig.get().physics.separationPower);
	particleSize = uniform(PLConfig.get().appearance.particleSize);
	particleSmoothness = uniform(PLConfig.get().appearance.particleSmoothness);
	uVelocityToSize = uniform(PLConfig.get().appearance.velToSize ? 1 : 0);
	uVelocityToAlpha = uniform(PLConfig.get().appearance.velToAlpha ? 1 : 0);
	uOrientToVelocity = uniform(PLConfig.get().appearance.orientToVel ? 1 : 0);
	uIsAnular = uniform(PLConfig.get().appearance.makeAnular ? 1 : 0);
	uParticleShape = uniform(PLConfig.get().appearance.shape);
	backgroundColor = uniform(color(0xecebdb));
	frameColor = uniform(color(0x191e24));
	attractorValues = uniforms(Array(64).fill(0)); //  not uniform, but uniforms !

	// noise animation, not uniforms, only used in normal JS
	useNoiseMatrixAnim = PLConfig.get().attraction.useNoise;
	noiseTimeScale = PLConfig.get().attraction.noiseTimeScale;
	noiseFrequency = PLConfig.get().attraction.noiseFrequency;


	////////////////////////////////////////////////////////////////////////////////////////

	constructor(scene: Scene, camera: PerspectiveCamera, controls: TrackballControls, renderer: WebGPURenderer) {

		if (ParticlesLife.instance !== undefined) {
			throw new Error("ParticlesLife instance already exists");
		}
		ParticlesLife.instance = this;

		this.scene = scene;
		this.camera = camera;
		this.renderer = renderer;
		this.controls = controls;

		this.camera.position.set(0, 0, 100);
		this.camera.lookAt(0, 0, 0);
		this.controls.noRotate = true;
		this.controls.maxDistance = 200.0;

		const baseColors: PLPalette = PLPalManager.current;
		this.backgroundColor = uniform(color(baseColors.backgroundColor));
		this.frameColor = uniform(color(baseColors.frameColor));
		this.scene.background = this.backgroundColor.value;

		/////////////////////////// COMPUTING ////////////////////////////////////
		const positionBuffer = storage(new StorageInstancedBufferAttribute(this.particleCount, 2), "vec2", this.particleCount);
		const velocityBuffer = storage(new StorageInstancedBufferAttribute(this.particleCount, 2), "vec2", this.particleCount);
		this.updateTypesColorsBuffer();

		const range = 128; // the simulation space is a square. 
		const uRange = uniform(range);
		const halfRange = range * 0.5;
		const uHalfRange = uniform(halfRange);

		/**
		 * Initialize the particles positions, velocities and colors
		 */
		this.computeInit = tslFn(() => {
			const timer = timerGlobal(10000.0); // the function is also called when randomizePositions is called, so the timer is used to make sure the positions are different
			const randX = instanceIndex.add(timer).hash();
			const randY = instanceIndex.add(timer).add(100.0).hash();
			const position = positionBuffer.element(instanceIndex);
			// positioning with some safety margin
			position.x = randX.mul(uRange.sub(EPSILON.mul(2))).add(EPSILON).sub(uHalfRange);
			position.y = randY.mul(uRange.sub(EPSILON.mul(2))).add(EPSILON).sub(uHalfRange);

			//resetting the velocity
			const velocity = velocityBuffer.element(instanceIndex);
			velocity.x = 0 ;
			velocity.y = 0;

		})().compute(this.particleCount);
		this.renderer.compute(this.computeInit);

		const { separationDistance, attractionDistance, maxForce, maxVelocity, friction } = this;
		const { mod, getAttWeight, getResponseLin, getResponseQua, getResponseCub, getResponseRot, getResponseRot2 } = this;

		/**
		 * This is the main compute node, in charge of the particles simulation
		 * Runs on each particle, calculates the forces and updates their velocity and position
		 * Called each frame , see update()
		 */
		this.computeParticles = tslFn(() => {

			// buffer sampling
			const position = positionBuffer.element(instanceIndex);
			const velocity = velocityBuffer.element(instanceIndex);
			const type = instanceIndex.remainder(this.nbTypes); // type is determined just by the index

			// some quick access 
			const att = int(this.uAttractorType);
			const delta = timerDelta(20.0).mul(this.timeScale); // timerDelta param doesn't seem to work with uniform. The 20 is arbitrary

			// precalc
			const maxDist = attractionDistance.add(separationDistance);
			const maxForceSq = maxForce.mul(maxForce);
			const maxVelSq = maxVelocity.mul(maxVelocity);
			const maxDistSq = maxDist.mul(maxDist);

			// some local variables
			const totalForce = vec2(0, 0).toVar();
			const dir = vec2(0.0).toVar();

			// brute force loop, could be vastly optimized with a space partitioning algorithm
			// the number of particles is kept relatively low to compensate and keep it dynamic
			// the goal being didactic and artistic, not performances
			loop({ type: 'uint', start: 0, end: this.particleCount, condition: '<' }, ({ i }) => {

				If(i.equal(instanceIndex), () => { return; }); // no forces on self

				const otherPosition = positionBuffer.element(i);
				const otherType = i.remainder(this.nbTypes);
				const attFactor = getAttWeight(type, otherType);

				// calculating and wrapping vector
				dir.xy = otherPosition.sub(position).xy.add(uHalfRange);
				dir.x = mod(dir.x, uRange).sub(uHalfRange);
				dir.y = mod(dir.y, uRange).sub(uHalfRange);

				If(lengthSq(dir).greaterThan(maxDistSq), () => { return; }); // no forces if too far

				// adding the force based on the attraction type				
				If(att.lessThan(1), () => { totalForce.addAssign(getResponseLin(attFactor, dir)) })
					.elseif(att.lessThan(2), () => { totalForce.addAssign(getResponseQua(attFactor, dir)) })
					.elseif(att.lessThan(3), () => { totalForce.addAssign(getResponseCub(attFactor, dir)) })
					.elseif(att.lessThan(4), () => { totalForce.addAssign(getResponseRot(attFactor, dir)) })
					.elseif(att.lessThan(5), () => { totalForce.addAssign(getResponseRot2(attFactor, dir)) })

			});

			// normalizing force
			If(lengthSq(totalForce).greaterThan(maxForceSq), () => {
				totalForce.assign(normalize(totalForce).mul(maxForce));
			});

			// updating velocity
			velocity.addAssign(totalForce.mul(delta));
			velocity.mulAssign(friction.oneMinus());

			// normalizing velocity
			If(lengthSq(velocity).greaterThan(maxVelSq), () => {
				velocity.assign(normalize(velocity).mul(maxVelocity));
			});

			// pointer interaction
			If(this.uPointerDown.equal(1), () => {
				dir.xy = this.uPointer.sub(position).xy;
				const dist = length(dir);
				const factor = clamp(dist.div(this.uPointerRange), EPSILON, EPSILON.oneMinus());
				const pointerForce = pow(factor.oneMinus(), 1.25).mul(this.uPointerAtt).mul(this.uPointerStrength); 
				velocity.addAssign(dir.mul(pointerForce.div(max(dist, EPSILON))));
			});

			// updating position
			position.addAssign(velocity.mul(delta));
			// wrapping position
			const mPos = position.toVar().add(uHalfRange);
			mPos.x.assign(mod(mPos.x, uRange).sub(uHalfRange));
			mPos.y.assign(mod(mPos.y, uRange).sub(uHalfRange));
			position.assign(mPos);


		})().compute(this.particleCount);

		/////////////////////////////////// DRAWING PARTICLES /////////////////////////////////////////
		/**
		 * shaping the particles alpha with SDF functions
		 */
		const opacityNode = tslFn(() => {
			const velocity = velocityBuffer.element(instanceIndex);
			const relVel = clamp(length(velocity), 0, maxVelocity).div(maxVelocity); // re-clamped because the pointer can make the velocity go over max (on purpose)
			const rot = cond(this.uOrientToVelocity.equal(1), atan2(velocity.y, velocity.x).negate(), 0.0);
			const size = cond(this.uVelocityToSize.equal(1), max(0.01, pow(relVel, 1.5)), 1.0).toVar();
			If(this.uIsAnular.equal(1), () => { size.subAssign(size.mul(float(0.15))) }); // anular shapes are drawn a bit smaller
			const nuv = uv().remap(0, 1, -1, 1);
			const shape = float(0.0).toVar().assign(this.shapeCircle(nuv, size, rot));

			// I don't like this big if/else. The node should probably be rewritten after a shape update from the UI
			If(this.uParticleShape.equal(1), () => { shape.assign(this.shapeRoundedX(nuv, size, rot)) })
				.elseif(this.uParticleShape.equal(2), () => { shape.assign(this.shapeHex(nuv, size, rot)) })
				.elseif(this.uParticleShape.equal(3), () => { shape.assign(this.shapeCross(nuv, size, rot)) })
				.elseif(this.uParticleShape.equal(4), () => { shape.assign(this.shapeMoon(nuv, size, rot)) })
				.elseif(this.uParticleShape.equal(5), () => { shape.assign(this.shapeHRect(nuv, size, rot)) })
				.elseif(this.uParticleShape.equal(6), () => { shape.assign(this.shapeVRect(nuv, size, rot)) })
				.elseif(this.uParticleShape.equal(7), () => { shape.assign(this.shapeHLine(nuv, size, rot)) })
				.elseif(this.uParticleShape.equal(8), () => { shape.assign(this.shapeVLine(nuv, size, rot)) })

			If(this.uIsAnular.equal(1), () => {
				shape.assign(this.anular(shape, size.mul(float(.15)))); // could add a slider for that factor 
			})
			const velToAlphaMul = cond(this.uVelocityToAlpha.equal(1), relVel, 1.0);
			return smoothstep(this.particleSmoothness.negate(), 0.0, shape).oneMinus().mul(velToAlphaMul);
		});

		// Color is picked from the typeColorsBuffer according the instanceIndex
		const colorNode = tslFn(() => {
			return this.typeColorsBuffer.element(instanceIndex.remainder(this.nbTypes));
		});

		const particleMat: SpriteNodeMaterial = new SpriteNodeMaterial();
		particleMat.colorNode = colorNode();
		particleMat.opacityNode = opacityNode();
		particleMat.positionNode = positionBuffer.toAttribute();
		particleMat.scaleNode = this.particleSize;
		particleMat.transparent = true;
		particleMat.depthWrite = false;
		particleMat.depthTest = false;		
		this.particleMat = particleMat;

		const particles = new InstancedMesh(new PlaneGeometry(5, 5), particleMat, this.particleCount);
		particles.frustumCulled = false;
		this.scene.add(particles);

		//////////////////////////////////////////////////////////////////////////////////////////

		this.addFrame(range);
		this.addAttractorCurveView();
		this.initPointer();
		Root.registerAnimatedElement(this); // just hooking the update function to the main loop
	}

	/**
	 * A small buffer contains the colors associated to the 8 types of particles
	 * Should probably replace this with a uniform array
	 * @param isCustom a flag indicating to use the users custom colors
	 */
	updateTypesColorsBuffer(isCustom:boolean = false) {

		if (this.typeColorsBuffer === undefined) {
			// creates the buffer if it doesn't exist
			const initArray = new Float32Array(this.maxTypes * 4).fill(0.0);
			this.typeColorsBuffer = storageObject(new StorageInstancedBufferAttribute(initArray, 4), "vec4", this.maxTypes);
		}

		// set colors from the palette
		let typeColors: Color[];
		if( !isCustom)
			typeColors = PLPalManager.current.particlesColors.map((c) => new Color(c));
		else 
			typeColors = PLConfig.get().appearance.customColors.map((c) => new Color(c));

		const updateTypesColorBuffer = tslFn(() => {
			for (let i = 0; i < this.maxTypes; i++) {
				const c = typeColors[i];
				this.typeColorsBuffer.element(i).assign(vec4(c.r, c.g, c.b, 1.0));
			}
		});
		this.renderer.compute(updateTypesColorBuffer().compute(this.maxTypes));
	}
	//////// TSL REPONSE FUNCTIONS ////////
	/**
	 * Get the weight of the attraction/repulsion between two types, from the uniform array
	 * @param t1_immutable : type 1, from 0 to maxTypes
	 * @param t2_immutable : type 2, from 0 to maxTypes
	 */
	getAttWeight = tslFn(([t1_immutable, t2_immutable]) => {
		// picking from the uniforms array
		return this.attractorValues.element(t1_immutable.mul(this.maxTypes).add(t2_immutable));
	});

	/**
	 * The main force calculation, based on the distance between particles
	 * if under separationDistance, it will repel
	 * if over separationDistance and under attractionDistance, it will attract or repel based on the attFactor (-1 to 1)
	 * The curve is shaped with various parameters, as seen in the UI
	 * @param attFactor : the weight of the attraction/repulsion, -1 to 1
	 * @param dir : the vec2 between the particles
	 */
	getAttractorForce = tslFn(([attFactor, dir]) => {
		const len = length(dir);
		const maxDist = this.attractionDistance.add(this.separationDistance);
		const dist = min(maxDist, len);
		const force = float(0.0).toVar();

		If(dist.lessThan(this.separationDistance), () => {
			force.assign(len.div(this.separationDistance).pow(this.separationPower).sub(1.0).mul(this.separationForce)); //from -separationForce to 0
		}).else(() => {
			const factor = min(dist.sub(this.separationDistance).div(this.attractionDistance), EPSILON.oneMinus()); // clamping and normalizing distance
			force.assign(this.pcurve(this.gain(factor, this.attractionGain), this.attractionAttack, this.attractionDecay).mul(attFactor).mul(this.attractionForce));

		});
		return force;

	});

	// follows various ways to apply the direction vector to the force
	getResponseLin = tslFn(([attraction, dir]) => {
		const len = length(dir);
		const force = this.getAttractorForce(attraction, dir);
		return dir.mul(force.div(max(len, EPSILON)));
	});

	getResponseQua = tslFn(([attraction, dir]) => {
		const len = length(dir);
		const force = this.getAttractorForce(attraction, dir);
		return dir.mul(force.div(max(len.mul(len), EPSILON)));
	});

	getResponseCub = tslFn(([attraction, dir]) => {
		const len = length(dir);
		const force = this.getAttractorForce(attraction, dir);
		return dir.mul(force.div(max(len.mul(len).mul(len), EPSILON)));
	});

	getResponseRot = tslFn(([attraction, dir]) => {
		const len = length(dir);
		const force = this.getAttractorForce(attraction, dir);
		const delta = vec2(dir.y.negate(), dir.x); // perpendicular
		return delta.mul(force.div(max(len, EPSILON)));
	});

	getResponseRot2 = tslFn(([attraction, dir]) => {
		const len = length(dir);
		const force = this.getAttractorForce(attraction, dir);
		const angle = attraction.negate().mul(PI); // angle from attractor
		// this is all a bit slow , precalculating the sin/cos would probably be better
		const delta = vec2(
			dir.x.mul(cos(angle)).add(dir.y.mul(sin(angle))),
			dir.x.mul(sin(angle).mul(-1.0)).add(dir.y.mul(cos(angle)))
		);
		return delta.mul(force.div(max(len, EPSILON)));
	});
	//////// TSL : SHAPING FUNCTIONS, also see ../nodes/DistanceFunctions.ts ////////
	// Applying the rotation to the UVs and shaping the SDFs for the use case
	shapeCircle = tslFn(([uv_immutable, size_immutable, rot_immutable]) => {
		const uv = vec2(uv_immutable).toVar();
		uv.rotateAssign(rot_immutable);
		return sdCircle(uv_immutable, size_immutable);
	});

	shapeRoundedX = tslFn(([uv_immutable, size_immutable, rot_immutable]) => {
		const uv = vec2(uv_immutable).toVar();
		uv.rotateAssign(rot_immutable);
		return sdRoundedX(uv, size_immutable, size_immutable.mul(float(0.25)));
	});

	shapeCross = tslFn(([uv_immutable, size_immutable, rot_immutable]) => {
		const uv = vec2(uv_immutable).toVar();
		uv.rotateAssign(rot_immutable);
		return sdCross(uv, vec2(1.0, 0.25).mul(size_immutable), float(0.0));
	});

	shapeHex = tslFn(([uv_immutable, size_immutable, rot_immutable]) => {
		const uv = vec2(uv_immutable).toVar();
		uv.rotateAssign(rot_immutable);
		return sdHexagon(uv, size_immutable);
	});

	shapeMoon = tslFn(([uv_immutable, size_immutable, rot_immutable]) => {
		const uv = vec2(uv_immutable).toVar();
		uv.rotateAssign(rot_immutable);
		return sdMoon(uv, size_immutable.mul(-.5), size_immutable.mul(1.0), size_immutable.mul(0.75));
	});

	shapeHRect = tslFn(([uv_immutable, size_immutable, rot_immutable]) => {
		const uv = vec2(uv_immutable).toVar();
		uv.rotateAssign(rot_immutable);
		return sdRoundedBox(uv, vec2(1.0, .33).mul(size_immutable), vec4(.25));
	});

	shapeVRect = tslFn(([uv_immutable, size_immutable, rot_immutable]) => {
		const uv = vec2(uv_immutable).toVar();
		uv.rotateAssign(rot_immutable);
		return sdRoundedBox(uv, vec2(0.33, 1.0).mul(size_immutable), vec4(.25));
	});

	shapeHLine = tslFn(([uv_immutable, size_immutable, rot_immutable]) => {
		const uv = vec2(uv_immutable).toVar();
		uv.rotateAssign(rot_immutable);
		return sdBox(uv, vec2(1.0, .1).mul(size_immutable));
	});

	shapeVLine = tslFn(([uv_immutable, size_immutable, rot_immutable]) => {
		const uv = vec2(uv_immutable).toVar();
		uv.rotateAssign(rot_immutable);
		return sdBox(uv, vec2(0.1, 1.0).mul(size_immutable));
	});

	anular = tslFn(([shape_immutable, factor_immutable]) => {
		return abs(shape_immutable).sub(factor_immutable);
	});

	//////// TSL UTILS /////////
	// GLSL mod , remainder() didn't work for my purpose
	mod = tslFn(([x, y]) => {
		return x.sub(y.mul(x.div(y).floor()));
	});

	// saw this was in MathUtils, not in a tsl function, not sure about usage, so I'm reimplementing it here
	// These are, as always, from Inigo Quilez : https://iquilezles.org/articles/functions/
	// everyone should know and use those, especially in the gen-art space
	pcurve = tslFn(([x, a, b]) => {
		const k = float(pow(a.add(b), a.add(b)).div(pow(a, a).mul(pow(b, b))));
		return k.mul(pow(x, a).mul(pow(sub(1.0, x), b)));
	});

	gain = tslFn(([x, k]) => {
		const a = float(mul(0.5, pow(mul(2.0, cond(x.lessThan(0.5), x, sub(1.0, x))), k))).toVar();
		return cond(x.lessThan(0.5), a, sub(1.0, a));
	});



	frame: Mesh;
	/**
	 * Create the frame, also serving as mask for the particles
	 * Alpha-blending it over the rest. Not optimal.
	 * @param range : particles simulation space, assumed square
	 */
	addFrame(range: number): void {
		const frameGeom: BufferGeometry = new PlaneGeometry(range * 5, range * 5);
		const hRange = range * 0.5;
		const frameMat = new MeshBasicNodeMaterial();
		const frameColor = tslFn(() => {
			const borderSize = 0.01;
			return mix(this.frameColor, this.backgroundColor, sdBox(positionWorld.xy.div(float(hRange)), vec2(1.0).add(borderSize)).step(0.0).oneMinus());
		});
		const frameAlpha = tslFn(() => {
			return sdBox(positionWorld.xy.div(float(hRange)), vec2(1.0)).step(0.0).oneMinus();
		});
		frameMat.colorNode = frameColor();
		frameMat.transparent = true;
		frameMat.opacityNode = frameAlpha();
		frameMat.depthWrite = false;
		frameMat.depthTest = true;
		this.frame = new Mesh(frameGeom, frameMat);
		this.frame.renderOrder = 100;
		this.scene.add(this.frame);
	}

	curveContainer: Group;
	/**
	 * A Quad to display the general attraction curve
	 * Represents the force between two particles based on their distance, when their attraction factor is one.
	 * The right part of the curve can be negative when this factor is negative
	 */
	addAttractorCurveView(): void {
		const cv: Group = new Group();
		cv.position.set(100, 100, 0); // will be repositioned every frame
		this.scene.add(cv);

		const bgColor = color(0x191e24);
		const lineColor = color(0xff1f70);
		const axisColor = color(0xa6adbb);
		const bgGeom: BufferGeometry = new PlaneGeometry(1, 1);
		const bgMat = new MeshBasicNodeMaterial();
		bgMat.colorNode = bgColor;
		bgMat.depthTest = false;
		bgMat.depthWrite = false;
		bgMat.transparent = true; // to render on top of transparency
		const bgMesh: Mesh = new Mesh(bgGeom, bgMat);
		cv.add(bgMesh);

		const curveGeom: BufferGeometry = new PlaneGeometry(.9, .9); // some margins
		const curveMat = new MeshBasicNodeMaterial();
		curveMat.depthTest = false;
		curveMat.depthWrite = false;
		curveMat.transparent = true;
		const curveMesh: Mesh = new Mesh(curveGeom, curveMat);
		bgMesh.add(curveMesh);

		/**
		 * Draws the curve and important lines
		 * could add resolution uniform to calculate the line width with more accuracy
		 */

		curveMat.colorNode = tslFn(() => {
			const vuv = uv(); // everything based on the quad UVs
			const totalDist = this.separationDistance.add(this.attractionDistance);
			const yRatio = this.separationForce.div(this.attractionForce.add(this.separationForce));
			const r = this.getAttractorForce(1.0, vec2(vuv.x.mul(totalDist), 0.0));
			const rr = r.remap(this.separationForce.negate(), this.attractionForce, -0.45, 0.45);
			const lineWx = 0.0015;
			const lineWy = 0.015;
			const oCol = bgColor.toVar();
			const ax = vuv.x.sub(this.separationDistance.div(totalDist));
			const ay = vuv.y.mul(1.1).sub(.05).sub(yRatio);
			const axiss = smoothstep(-lineWx, 0.0, ax).sub(smoothstep(0.0, lineWx, ax))
				.add(smoothstep(-lineWy, 0.0, ay).sub(smoothstep(0.0, lineWy, ay)));
			const fCurve = smoothstep(0.0, 0.01, abs(vuv.y.sub(.5).sub(rr))).oneMinus();
			oCol.assign(mix(oCol, axisColor, axiss));
			oCol.assign(mix(oCol, lineColor, fCurve));
			return oCol;
		})();

		this.scene.add(this.camera);

		this.curveContainer = cv;
		this.curveContainer.renderOrder = 100;
	}

	// tried various options to modify the uniforms, this (accessing "array") seems to work and is concise
	setSingleWeight(i: number, value: number): void {
		this.attractorValues.array[i] = value;
	}

	setWeights(data: number[]): void {
		this.attractorValues.array = data;
	}

	// More convenient (but slower) to generate the noise here than in a tslFn ( mx_fractal_noise_float ) for access from the UI
	// the noise generator is https://www.npmjs.com/package/@webvoxel/fast-simplex-noise 
	matrixNoise: FastSimplexNoise = new FastSimplexNoise({ frequency: 1, octaves: 2, amplitude: 1.0, persistence: 0.5 });
	handleMatrixAnimation() {
		if (!this.useNoiseMatrixAnim) return;

		const newData = [];
		// for the whole matrix, so 8*8
		for (let i = 0; i < this.maxTypes; i++) {
			for (let j = 0; j < this.maxTypes; j++) {
				// sample the noise at the 2d position in the matrix
				const val = this.matrixNoise.scaled([(i + this.lastElapsed * this.noiseTimeScale) * this.noiseFrequency, j * this.noiseFrequency]);
				newData.push(val);
			}
		}
		this.setWeights(newData); // to update the uniforms
		setExtMatrixData(newData); // update the UI
	}

	pointer: Vector2 = new Vector2();
	scenePointer: Vector3 = new Vector3();
	pointerDown: boolean = false;
	uPointerDown = uniform(0);
	uPointer = uniform(new Vector2());
	uPointerRange = uniform(PLConfig.get().pointer.range);
	uPointerAtt = uniform(PLConfig.get().pointer.attraction);
	uPointerStrength = uniform(PLConfig.get().pointer.strength);

	initPointer(): void {
		this.renderer.domElement.addEventListener("pointerdown", this.onPointerDown.bind(this));
		this.renderer.domElement.addEventListener("pointerup", this.onPointerUp.bind(this));
		window.addEventListener("pointermove", this.onPointerMove.bind(this));
	}

	onPointerDown(e: PointerEvent): void {
		if (e.pointerType !== 'mouse' || e.button === 0) {
			this.pointerDown = true;
			this.uPointerDown.value = 1;
		}
		this.updateScreenPointer(e);
	}
	onPointerUp(e: PointerEvent): void {
		this.pointerDown = false;
		this.uPointerDown.value = 0;
		this.updateScreenPointer(e);
	}
	onPointerMove(e: PointerEvent): void {
		this.updateScreenPointer(e);
	}
	updateScreenPointer(e: PointerEvent): void {
		this.pointer.set(
			(e.clientX / window.innerWidth) * 2 - 1,
			- (e.clientY / window.innerHeight) * 2 + 1
		);
		this.rayCaster.setFromCamera(this.pointer, this.camera);
		this.rayCaster.ray.intersectPlane(this.iPlane, this.scenePointer);
		this.uPointer.value.x = this.scenePointer.x;
		this.uPointer.value.y = this.scenePointer.y;
	}

	scrollLimit: number = 64;
	clampControls(): void {

		this.camera.position.x = MathUtils.clamp(this.camera.position.x, -this.scrollLimit, this.scrollLimit);
		this.camera.position.y = MathUtils.clamp(this.camera.position.y, -this.scrollLimit, this.scrollLimit);
		this.controls.target.x = MathUtils.clamp(this.controls.target.x, -this.scrollLimit, this.scrollLimit);
		this.controls.target.y = MathUtils.clamp(this.controls.target.y, -this.scrollLimit, this.scrollLimit);
		this.camera.updateMatrixWorld(); // updating for curve placement
	}

	// some variables for the curve placement
	rayCaster: Raycaster = new Raycaster();
	iPlane: Plane = new Plane(new Vector3(0, 0, 1));
	tempV3: Vector3 = new Vector3();
	ctl: Vector2 = new Vector2();
	ctl3: Vector3 = new Vector3();
	ctr: Vector2 = new Vector2();
	ctr3: Vector3 = new Vector3();
	cbl: Vector2 = new Vector2();
	cbl3: Vector3 = new Vector3();
	cbr: Vector2 = new Vector2();
	cbr3: Vector3 = new Vector3();
	/**
	 * calculate the world position of the containing div and set the position and scale of the curve container to fit
	 * could be simplified
	 * @returns 
	 */
	handleCurvePlacement(): void {

		if (this.curveContainer === undefined) return;

		const curveElement = document.getElementById("curve-element");
		const curveRect = curveElement.getBoundingClientRect();

		this.ctl.set(
			(curveRect.left) / window.innerWidth * 2 - 1,
			-(curveRect.top) / window.innerHeight * 2 + 1,
		);
		this.rayCaster.setFromCamera(this.ctl, this.camera);
		this.rayCaster.ray.intersectPlane(this.iPlane, this.ctl3);
		this.ctr.set(
			(curveRect.right) / window.innerWidth * 2 - 1,
			-(curveRect.top) / window.innerHeight * 2 + 1,
		);
		this.rayCaster.setFromCamera(this.ctr, this.camera);
		this.rayCaster.ray.intersectPlane(this.iPlane, this.ctr3);
		this.cbl.set(
			(curveRect.left) / window.innerWidth * 2 - 1,
			-(curveRect.bottom) / window.innerHeight * 2 + 1,
		);
		this.rayCaster.setFromCamera(this.cbl, this.camera);
		this.rayCaster.ray.intersectPlane(this.iPlane, this.cbl3);
		this.cbr.set(
			(curveRect.right) / window.innerWidth * 2 - 1,
			-(curveRect.bottom) / window.innerHeight * 2 + 1,
		);
		this.rayCaster.setFromCamera(this.cbr, this.camera);
		this.rayCaster.ray.intersectPlane(this.iPlane, this.cbr3);

		this.curveContainer.position.set(
			(this.ctl3.x + this.ctr3.x) * .5,
			(this.ctl3.y + this.cbl3.y) * .5,
			0
		);

		this.curveContainer.scale.set(
			this.ctr3.x - this.ctl3.x,
			this.ctl3.y - this.cbl3.y,
			1
		);
	}

	resetCamera(): void {
		const resetDuration = 0.5;
		const resetEase: string = "power2.inOut";
		const tl = gsap.timeline();
		tl.to(this.camera.position, { x: 0, y: 0, z: 100, duration: resetDuration, ease: resetEase }, 0);
		tl.to(this.controls.target, { x: 0, y: 0, z: 0, duration: resetDuration, ease: resetEase }, 0);
	}

	phase: number = 1;
	lastElapsed: number = 0;
	update(dt: number, elapsed: number): void {

		this.clampControls();
		this.handleCurvePlacement();
		this.handleMatrixAnimation();
		//this.renderer.computeAsync(this.computeParticles);
		this.renderer.compute(this.computeParticles);

		

		this.lastElapsed = elapsed;
	}

	//////// UI ACCESS ////////
	/**
	 * Used when loading a saved config
	 * @param config 
	 */
	public static updateFullConfig(config: PLConfig): void {
		if (ParticlesLife.instance !== undefined) {
			const i = ParticlesLife.instance;
			i.nbTypes.value = config.attraction.nbTypes;
			i.timeScale.value = config.physics.timeScale;
			i.uAttractorType.value = config.attraction.response;
			i.friction.value = config.physics.friction;
			i.separationDistance.value = config.physics.separationDistance;
			i.attractionDistance.value = config.physics.attractionDistance;
			i.maxForce.value = config.physics.maxForce;
			i.maxVelocity.value = config.physics.maxVelocity;
			i.separationForce.value = config.physics.separationForce;
			i.attractionForce.value = config.physics.attractionForce;
			i.attractionAttack.value = config.physics.attractionAttack;
			i.attractionDecay.value = config.physics.attractionDecay;
			i.attractionGain.value = config.physics.attractionGain;
			i.separationPower.value = config.physics.separationPower;

			i.particleSize.value = config.appearance.particleSize;
			i.uAttractorType.value = config.attraction.response;
			i.particleSmoothness.value = config.appearance.particleSmoothness;
			i.uVelocityToSize.value = config.appearance.velToSize ? 1 : 0;
			i.uVelocityToAlpha.value = config.appearance.velToAlpha ? 1 : 0;
			i.uOrientToVelocity.value = config.appearance.orientToVel ? 1 : 0;
			i.uIsAnular.value = config.appearance.makeAnular ? 1 : 0;
			i.uParticleShape.value = config.appearance.shape;
			i.useNoiseMatrixAnim = config.attraction.useNoise;
			i.noiseTimeScale = config.attraction.noiseTimeScale;
			i.noiseFrequency = config.attraction.noiseFrequency;

			i.uPointerAtt.value = config.pointer.attraction;
			i.uPointerStrength.value = config.pointer.strength;
			i.uPointerRange.value = config.pointer.range;

			ParticlesLife.updatePalette(config.appearance.palette);
			ParticlesLife.updateWeightsMatrix(config.attraction.values);
		}
	}


	public static updateSingleWeight(i: number, value: number): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.setSingleWeight(i, value);
		}
	}

	public static updateWeightsMatrix(data: number[]): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.setWeights(data);
		}
	}

	public static updateNbTypes(value: number): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.nbTypes.value = value;
		}
	}

	public static updatePhyParam(param: string, value: number): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance[param].value = value;
		}
	}

	public static togglePerlinAnim(value: boolean): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.useNoiseMatrixAnim = value;
		}
	}

	public static updatePerlinParams(timeScale: number, frequency: number): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.noiseTimeScale = timeScale;
			ParticlesLife.instance.noiseFrequency = frequency;
		}
	}

	public static updateResponse(value: number): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.uAttractorType.value = value;
		}
	}

	public static updateVeloToSize(value: boolean): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.uVelocityToSize.value = value ? 1 : 0;
		}
	}

	public static updateVeloToAlpha(value: boolean): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.uVelocityToAlpha.value = value ? 1 : 0;
		}

	}

	public static updateOrientToVel(value: boolean): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.uOrientToVelocity.value = value ? 1 : 0;
		}
	}

	public static updateAnular(value: boolean): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.uIsAnular.value = value ? 1 : 0;
		}
	}

	public static updateAdditive(value: boolean): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.particleMat.blending = value ? AdditiveBlending : NormalBlending;
		}
	}

	public static updatePartShape(value: number): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.uParticleShape.value = value;
		}
	}

	public static updatePalette(value: string): void {
		if (ParticlesLife.instance !== undefined) {
			const i = ParticlesLife.instance;
			if( value === 'custom')
			{
				const app = PLConfig.get().appearance;
				i.scene.background = new Color(app.customBackgroundColor);
				i.backgroundColor.value = new Color(app.customBackgroundColor);
				i.frameColor.value = new Color(app.customFrameColor);
				i.updateTypesColorsBuffer(true);
			}
			else 
			{
				PLPalManager.current = new PLPalette(value as Palettes);
				const p: PLPalette = PLPalManager.current;
				i.scene.background = new Color(p.backgroundColor);
				i.backgroundColor.value = new Color(p.backgroundColor); // for some reason, doesn't work with color(p.backgroundColor);
				i.frameColor.value = new Color(p.frameColor);
				i.updateTypesColorsBuffer();
			}
		}
	}

	public static updatePointerParams(attraction: number, strength: number, range: number) {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.uPointerAtt.value = attraction;
			ParticlesLife.instance.uPointerStrength.value = strength;
			ParticlesLife.instance.uPointerRange.value = range;
		}
	}

	public static resetCamera(): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.resetCamera();
		}
	}

	public static randomizePositions(): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.renderer.compute(ParticlesLife.instance.computeInit);
		}
	}

	public static showHideCurve(value: boolean): void {
		if (ParticlesLife.instance !== undefined) {
			ParticlesLife.instance.curveContainer.visible = value;
		}
	}
}