import { useEffect, useRef, useState } from 'react';
import { PLPalette } from '../lib/elements/particlesLife/PLPalette';
import { PLPalManager } from '../lib/elements/particlesLife/PLPalManager';
import MatrixCellButton from './MatrixCellButton';
import styles from './MatrixEditor.module.css';
import { ParticlesLife } from '../lib/elements/ParticlesLife';
import gsap from 'gsap';
import PLConfig from '../lib/elements/particlesLife/PLConfig';
import Slider from './Slider';
import Collapsable from './Collapsable';

interface IMatrixEditorProps {
    config: PLConfig,
    onParamChange: (paramName: string, value: string | number | boolean) => void;
    onMatrixChange: (data: number[]) => void;
    dirty: boolean
}


export default function MatrixEditor({
    config,
    onParamChange,
    onMatrixChange,
    dirty,
}: IMatrixEditorProps) {

    const maxTypes = 8;
    const bufferLen = maxTypes * maxTypes;

    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        // just triggering a re-render
    }, [dirty]);


    // init the data array on mount
    useEffect(() => {
        handleClickRandomizeWeights(); // init
    }, []);


    const perlinControlsRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (perlinControlsRef.current) {
            if (config.attraction.useNoise) {
                gsap.to(perlinControlsRef.current, { opacity: "1.0", duration: 0.3 })
            } else {
                gsap.to(perlinControlsRef.current, { opacity: "0.25", duration: 0.3 })
            }
        }
    }, [config]);

    const handleOpenCloseChange = () => {
        setIsOpen(!isOpen);
    }

    const sendUpdateInterval = useRef<NodeJS.Timeout>(null);
    const handleCellValueChange = (i: number, value: number) => {
        const newData = config.attraction.values.map((v, index) => ((index === i) ? value : v));

        onMatrixChange(newData);
        clearInterval(sendUpdateInterval.current);
        sendUpdateInterval.current = setTimeout(() => {
            ParticlesLife.updateSingleWeight(i, value);
        }, 30);
    }

    const handleClickRandomizeWeights = () => {
        const newData = [];
        for (let i = 0; i < bufferLen; i++) {
            newData.push(Math.random() * 2 - 1);
        }

        onMatrixChange(newData);
    }

    const handleClickSetToZero = () => {
        const newData = new Array(bufferLen).fill(0);
        onMatrixChange(newData);
    }

    const handleNbTypeValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value);
        onParamChange("nbTypes", value);
    }


    const getGridDiv = () => {

        const currentPalette: PLPalette = PLPalManager.current;
        let colors: string[] = [];
        if( config.appearance.palette.toLowerCase() !== "custom")
            colors = currentPalette.particlesColors.map((c) => "#" + c.toString(16).padStart(6, "0"));
        else 
            colors = config.appearance.customColors.map((c) => "#" + c.toString(16).padStart(6, "0"));

        const columnHeaders = [];
        const rowHeaders = [];
        columnHeaders.push(<div key={"corner"} className={styles.GridCellHeader}></div>);
        for (let i = 0; i < config.attraction.nbTypes; i++) {
            //columnHeaders.push(<div className={styles.GridCellHeader} style={{backgroundColor: colors[i]}}>c{i+1}</div>);
            columnHeaders.push(<div key={"topheader-" + i} className={styles.GridCellHeaderTop} style={{ backgroundColor: colors[i] }}></div>);
            //rowHeaders.push(<div className={styles.GridCellHeader} style={{backgroundColor: colors[i]}}>r{i+1}</div>);
            rowHeaders.push(<div key={"leftheader-" + i} className={styles.GridCellHeaderLeft} style={{ backgroundColor: colors[i] }}></div>);
        }

        const grid = [];
        grid.push(columnHeaders);
        for (let i = 0; i < config.attraction.nbTypes; i++) {
            grid.push(rowHeaders[i]);
            for (let j = 0; j < config.attraction.nbTypes; j++) {
                const index: number = i * maxTypes + j;
                grid.push(<MatrixCellButton key={index} index={index} value={config.attraction.values[index]} onValueChange={handleCellValueChange} />);
            }
        }

        return (
            <div className="flex justify-center">
                <div className="w-fit h-fit grid gap-0.5 justify-center" style={{ gridTemplateColumns: `repeat(${config.attraction.nbTypes + 1}, 1fr)` }}>
                    {grid}
                </div>

            </div>
        );

    }

    const handleTogglePerlin = () => {
        onParamChange("useNoise", !config.attraction.useNoise);
    };

    const handleNoiseTimeScaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        onParamChange("noiseTimeScale", value);
    };

    const handleNoiseFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        onParamChange("noiseFrequency", value);
    };

    const handleNoiseAmplitudeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        onParamChange("noiseAmplitude", value);
    };

    const responses = [
        "Linear",
        "Quadratic",
        "Cubic",
        "Rotator 1",
        "Rotator 2"
    ]

    const handleResponseTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = responses.indexOf(event.target.value);
        onParamChange("response", value);
    }

    const handleMirrorValues = () => {
        for( let i:number = 0 ;i<8 ;i ++) {
            for( let j:number = 0; j<i ; j++) {
                if( i === j) continue;

                const index1 = i * 8 + j;
                const index2 = j * 8 + i;
                const value = config.attraction.values[index2];
                handleCellValueChange(index1, value);
            }
        }
    }

    return (

        <Collapsable title="Attraction/Repulsion rules">
            <Slider
                label="Number of types"
                min={2} max={8} step={1} isInt={true}
                value={config.attraction.nbTypes} paramName='nbTypes' onChange={(event) => handleNbTypeValueChange(event)}
            />
            <div>
                <label className="label">Attraction matrix</label>
                {getGridDiv()}
            </div>
            <div className='flex flex-wrap justify-between gap-4 mt-4'>
                <button className='btn btn-neutral btn-sm flex-grow' disabled={config.attraction.useNoise} onClick={handleClickRandomizeWeights}>Randomize weights</button>
                <button className='btn btn-neutral btn-sm flex-grow' disabled={config.attraction.useNoise} onClick={handleClickSetToZero}>Set weights to zero</button>
                <button className='btn btn-neutral btn-sm flex-grow' disabled={config.attraction.useNoise} onClick={handleMirrorValues}>Mirror top right to bottom left</button>

            </div>
            <div className="divider my-2"></div>
            <div className="slider px-1" >
                <div className="sliderLabel">Response type</div>
                <select className="select select-bordered select-sm w-full" value={responses[config.attraction.response]} onChange={handleResponseTypeChange}>
                    {
                        responses.map((response, index) => (
                            <option key={index}>{response}</option>
                        ))
                    }
                </select>
            </div>
            <div className="divider my-2"></div>
            <div className="form-control w-full">
                <label className="label cursor-pointer">
                    <span className="label-text">Apply noise animation to matrix</span>
                    <input type="checkbox" className="toggle" defaultChecked={config.attraction.useNoise} onClick={handleTogglePerlin} />
                </label>
                <div className="flex flex-col px-1" ref={perlinControlsRef}>
                    <Slider
                        label='Noise time scale' tooltip='How fast the noise scrolls'
                        min={0} max={2} step={0.001}
                        value={config.attraction.noiseTimeScale} paramName='noiseTimeScale' onChange={handleNoiseTimeScaleChange}
                    />
                    <Slider 
                        label="Noise frequency"
                        min={0.01} max={2} step={0.001}
                        value={config.attraction.noiseFrequency} paramName="noiseFrequency" onChange={handleNoiseFrequencyChange}
                    />
                    <Slider 
                        label="Noise amplitude"
                        min={0.01} max={1} step={0.001}
                        value={config.attraction.noiseAmplitude} paramName="noiseAmplitude" onChange={handleNoiseAmplitudeChange}
                    />
                </div>
            </div>
        </Collapsable>
    )
}