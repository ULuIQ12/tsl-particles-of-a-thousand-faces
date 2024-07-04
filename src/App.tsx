import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './App.css'
import MatrixEditor from './components/MatrixEditor';
import PhysicsEdit from './components/PhysicsEdit';
import Apparence from './components/Apparence';
import PointerInteraction from './components/PointerInteraction';
import PLConfig from './lib/elements/particlesLife/PLConfig';
import { ParticlesLife } from './lib/elements/ParticlesLife';
import { Palettes } from './lib/elements/particlesLife/PLPalette';
import ConfigPresets from './components/ConfigPresets';
import IntroModal from './components/IntroModal';
import { brightness, cameraIcon, closeCross, crosshairIcon, fxIcon, githubIcon, globeIcon, moonIcon, questionIcon, saveIcon, sunIcon, tools, twitterIcon, uluLogo, uploadIcon } from './components/GFX';
import { Root } from './lib/Root';
import InfoModal from './components/InfoModal';

export let setExtMatrixData = (data: number[]) => { };

function App() {

	const [config, setConfig] = useState(PLConfig.get());
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const openBtRef = useRef<HTMLButtonElement>(null);
	const sideButtonsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		(document.getElementById('intro-modal') as unknown as any).showModal();
	}, []);

	useEffect(() => {
		if (isDrawerOpen) {
			const tl = gsap.timeline();
			if (sideButtonsRef.current !== null) tl.to(sideButtonsRef.current, { left: 450, duration: 0.25, ease: "power1.out" }, 0);
			if (openBtRef.current !== null) tl.to(openBtRef.current, { left: -50, duration: 0.25, ease: "power2.inOut" }, 0);

		}
		else {
			const tl = gsap.timeline();
			if (sideButtonsRef.current !== null) tl.to(sideButtonsRef.current, { left: -50, duration: 0.2, ease: "power1.in" }, 0);
			if (openBtRef.current !== null) tl.to(openBtRef.current, { left: 16, duration: 0.2, ease: "power2.inOut" }, 0);
		}
	}, [isDrawerOpen]);

	const handleOpen = () => {
		setIsDrawerOpen(true);
	};

	const handleClose = () => {
		setIsDrawerOpen(false);
	};

	const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
	useEffect(() => {
		localStorage.setItem('theme', theme);
		const localTheme = localStorage.getItem('theme');
		document.querySelector('html')?.setAttribute('data-theme', localTheme || 'dark');
	}, [theme]);

	const handleToggleDark = () => {
		console.log( "toggle theme")
		setTheme(theme === 'dark' ? 'light' : 'dark');
	};

	const [isPaletteDirty, setIsPaletteDirty] = useState(false);
	const handlePaletteUpdate = () => {
		setIsPaletteDirty(!isPaletteDirty);
	};

	const handleLoadConfig = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (event) => {
					const json = event.target?.result as string;
					const parsed = JSON.parse(json);
					setConfig(parsed);
					ParticlesLife.updateFullConfig(parsed);
				};
				reader.readAsText(file);
			}
		};
		input.click();
	};

	const saveConfigToJSON = () => {
		const data = JSON.stringify(config);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'particlesConfig' + new Date().getTime() + '.json';
		a.click();
		URL.revokeObjectURL(url);
	};

	const handlePhyParamChange = (paramName: string, value: number) => {
		config.physics[paramName] = value;
		setConfig({ ...config });
		ParticlesLife.updatePhyParam(paramName, value);
	};

	const handleAttParamChange = (paramName: string, value: string | number | boolean) => {
		config.attraction[paramName] = value;
		setConfig({ ...config });
		switch (paramName) {
			case 'nbTypes':
				ParticlesLife.updateNbTypes(value as number);
				break;
			case 'useNoise':
				ParticlesLife.togglePerlinAnim(value as boolean);
				break;
			case 'noiseTimeScale':
				ParticlesLife.updatePerlinParams(value as number, config.attraction.noiseFrequency as number);
				break;
			case 'noiseFrequency':
				ParticlesLife.updatePerlinParams(config.attraction.noiseTimeScale as number, value as number);
				break;
			case 'response':
				ParticlesLife.updateResponse(value as number);
				break;
		}
	}

	const handleAttMatrixChange = (data: number[]) => {
		config.attraction.values = data;
		ParticlesLife.updateWeightsMatrix(data);
		setConfig({ ...config });
	}

	setExtMatrixData = (data: number[]) => {
		handleAttMatrixChange(data);
	};

	const handleAppParamChange = (paramName: string, value: string | number | boolean) => {
		config.appearance[paramName] = value;
		setConfig({ ...config });
		switch (paramName) {
			case 'palette':
				if ((value as string).toLowerCase() === 'custom') {
					ParticlesLife.updatePalette('custom');
				}
				else {
					ParticlesLife.updatePalette(value as Palettes);
				}
				handlePaletteUpdate();
				break;
			case 'shape':
				ParticlesLife.updatePartShape(value as number);
				break;
			case 'particleSize':
			case 'particleSmoothness':
				ParticlesLife.updatePhyParam(paramName, value as number);
				break;
			case 'velToSize':
				ParticlesLife.updateVeloToSize(value as boolean);
				break;
			case 'velToAlpha':
				ParticlesLife.updateVeloToAlpha(value as boolean);
				break;
			case 'orientToVel':
				ParticlesLife.updateOrientToVel(value as boolean);
				break;
			case 'makeAnular':
				ParticlesLife.updateAnular(value as boolean);
				break;
			case 'additive':
				ParticlesLife.updateAdditive(value as boolean);
				break;

		}
	}

	const handlePointerParamChange = (paramName: string, value: number) => {
		config.pointer[paramName] = value;
		setConfig({ ...config });
		switch (paramName) {
			case 'attraction':
				ParticlesLife.updatePointerParams(value, config.pointer.strength, config.pointer.range);
				break;
			case 'strength':
				ParticlesLife.updatePointerParams(config.pointer.attraction, value, config.pointer.range);
				break;
			case 'range':
				ParticlesLife.updatePointerParams(config.pointer.attraction, config.pointer.strength, value);
				break;
		}
	}

	const handleResetCamera = () => {
		ParticlesLife.resetCamera();
	}

	const handlePresetLoadRequest = (preset) => {
		console.log("handlePresetLoad : ", preset)
		setConfig(preset);
		ParticlesLife.updateFullConfig(preset);
		ParticlesLife.randomizePositions();
	}

	const [promoLinksMenuOpen, setPromoLinksMenuOpen] = useState(false);
	const promoMenuRef = useRef<HTMLUListElement>(null);
	const logoRef = useRef<HTMLDivElement>(null);
	const customPaletteUpdateTimeout = useRef<NodeJS.Timeout>(null);
	const handlePromoToggle = () => {
		setPromoLinksMenuOpen(!promoLinksMenuOpen);
		const tl = gsap.timeline();
		if (promoLinksMenuOpen) {
			tl.to(promoMenuRef.current, { opacity: 0, bottom: 96, duration: 0.2, ease: "power2.in" }, 0);
			tl.to(logoRef.current, { rotate: 10, duration: 0.1, ease: "power2.in" }, 0);
			tl.to(logoRef.current, { rotate: 0, duration: 0.5, ease: "elastic.out" }, 0.1);


		}
		else {
			tl.to(promoMenuRef.current, { opacity: 1, bottom: 80, duration: 0.2, ease: "power2.out" }, 0);
			tl.to(logoRef.current, { rotate: -10, duration: 0.1, ease: "power2.in" }, 0);
			tl.to(logoRef.current, { rotate: 0, duration: 0.5, ease: "elastic.out" }, 0.1);
		}
	}

	const handleCustomChange = (type: string, value: number, index?: number) => {
		switch (type) {
			case 'color':
				config.appearance.customColors[index] = value;
				break;
			case 'background':
				config.appearance.customBackgroundColor = value;
				break;
			case 'frame':
				config.appearance.customFrameColor = value;
				break;
		}
		setConfig({ ...config });
		clearTimeout(customPaletteUpdateTimeout.current);
		customPaletteUpdateTimeout.current = setTimeout(() => {
			ParticlesLife.updatePalette('custom');
		}, 30);
	}

	const handleCaptureRequest = () => {
		Root.StartCapture();
	}

	const [infoModalOpen, setInfoModalOpen] = useState(false);
	const handleShowInfosClick = () => {
		setInfoModalOpen(true);
		(document.getElementById('info-modal') as unknown as any).showModal();
	}

	const handleInfoClose = () => {
		setInfoModalOpen(false);
		(document.getElementById('info-modal') as unknown as any).close();
	}

	return (
		<div id='app'>
			<div className="drawer-content flex flex-col gap-1">
				<div className="tooltip tooltip-right" data-tip="Configuration">
					<button className="btn btn-neutral btn-circle" onClick={handleOpen}> {tools()} </button>
				</div>
				<div className="tooltip tooltip-right" data-tip="Informations">
					<button className="btn btn-neutral btn-circle" onClick={handleShowInfosClick}>{questionIcon()}</button>
				</div>
				<div className="tooltip tooltip-right" data-tip="Capture current state">
					<button className="btn btn-neutral btn-circle" onClick={handleCaptureRequest}>{cameraIcon()}</button>
				</div>
			</div>
			<div className='drawer overflow-hidden'>
				<input id="my-drawer" type="checkbox" className="drawer-toggle" checked={isDrawerOpen} onChange={() => { }} />

				<div className="drawer-side w-fit h-fit max-h-screen">
					<div className='menu pr-0'>
						<div className='flex flex-row gap-1 pt-2'>
							<div className='flex flex-col gap-2'>
								<ConfigPresets onLoadRequest={handlePresetLoadRequest} />
								<PhysicsEdit config={config} onParamChange={handlePhyParamChange} />
								<MatrixEditor config={config} onParamChange={handleAttParamChange} onMatrixChange={handleAttMatrixChange} dirty={isPaletteDirty} />
								<Apparence config={config} onParamChange={handleAppParamChange} onPaletteUpdate={handlePaletteUpdate} onCustomChange={handleCustomChange} />
								<PointerInteraction config={config} onParamChange={handlePointerParamChange} />
							</div>
						</div>
					</div>
				</div>
			</div>
			<div ref={sideButtonsRef} className='absolute left-[-50px] flex flex-col gap-1'>
				<button className="btn btn-neutral btn-circle drawer-button mb-2" onClick={handleClose}>{closeCross()}</button>
				<div className="tooltip tooltip-right" data-tip="Reset camera">
					<button className=" btn btn-neutral btn-circle btn-sm" onClick={handleResetCamera}>{crosshairIcon()}</button>
				</div>
				<div className="tooltip tooltip-right" data-tip="Toggle light/dark UI">
					<label className="swap swap-rotate btn btn-neutral btn-circle btn-sm" >
						<input type="checkbox" className="theme-controller" value="light" onChange={handleToggleDark}  />
						{sunIcon()}
						{moonIcon()}
					</label>
				</div>
				<div className='tooltip tooltip-right' data-tip="Save parameters to JSON file">
					<button className="btn btn-neutral btn-circle btn-sm" onClick={saveConfigToJSON}>{saveIcon()}</button>
				</div>
				<div className="tooltip tooltip-right" data-tip="Import JSON parameters">
					<button className="btn btn-neutral btn-circle btn-sm" onClick={handleLoadConfig}>{uploadIcon()}</button>
				</div>
			</div>
			<div className='fixed bottom-4 right-8'>
				<div ref={logoRef}>
					<button onClick={handlePromoToggle}>{uluLogo()}</button>
				</div>
				<ul ref={promoMenuRef} className="menu bg-base-200 rounded-box fixed bottom-24 right-8 opacity-0 px-0">
					<li><a href="https://www.ulucode.com/" className="tooltip tooltip-left" data-tip="Website">{globeIcon()}</a></li>
					<li><a href="https://x.com/ULuIQ12" className="tooltip tooltip-left" data-tip="Twitter/X">{twitterIcon()}</a></li>
					<li><a href="https://github.com/ULuIQ12" className="tooltip tooltip-left" data-tip="GitHub">{githubIcon()}</a></li>
					<li><a href="https://www.fxhash.xyz/u/Christophe%20%22Ulu%22%20Choffel" className="tooltip tooltip-left" data-tip="fx(hash)">{fxIcon()}</a></li>
				</ul>
			</div>
			<IntroModal />
			<InfoModal isOpen={infoModalOpen} onClose={handleInfoClose} />
		</div>
	)
}

export default App
