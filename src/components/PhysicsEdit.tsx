import { useState } from "react";
import CurveOutput from "./CurveOutput";
import PLConfig from "../lib/elements/particlesLife/PLConfig";
import Slider from "./Slider";
import Collapsable from "./Collapsable";
import { ParticlesLife } from "../lib/elements/ParticlesLife";

interface IPhysicsEditProps {
    config: PLConfig,
    onParamChange: (paramName: string, value: number) => void;
}

export default function PhysicsEdit({
    config,
    onParamChange,
}: IPhysicsEditProps) {

    const [isOpen, setIsOpen] = useState(true);
    const handleOpenCloseChange = () => {
        setIsOpen(!isOpen);
    }

    const handleParamChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        paramName: string,
    ) => {
        const value = parseFloat(event.target.value);
        onParamChange(paramName, value);
    }

    const handleRandomizePositions = () => {
        ParticlesLife.randomizePositions();
    }

    const handleRandomizeSliders = () => {
        const r = {
            friction: Math.random() * .5,
            maxForce: Math.random() * 3,
            maxVelocity: Math.random() * 3,
            separationDistance: Math.random() * 16,
            attractionDistance: Math.random() * 32,
            separationForce: Math.random(),
            attractionForce: Math.random(),
            attractionAttack: Math.random() * 2 + 0.5,
            attractionDecay: Math.random() * 2 + 0.5,
            attractionGain: Math.random() * 4 + 0.5,
            separationPower: Math.random() * 12 + 0.1,
        }
        for (const key in r) {
            onParamChange(key, r[key]);
        }
    }

    return (
        <>
            <Collapsable title="Physics parameters" onOpenCloseChange={handleOpenCloseChange}>
                <Slider 
                    label="Timescale" tooltip="Multiplier on the simulation speed. Prefer the other sliders first" 
                    min={0} max={5} step={0.001} 
                    value={config.physics.timeScale} paramName="timeScale" onChange={handleParamChange} 
                />
                <Slider
                    label="Friction" tooltip="Applied to the velocity"
                    min={0} max={1} step={0.001}
                    value={config.physics.friction} paramName="friction" onChange={handleParamChange}
                />
                <Slider
                    label="Max. force" tooltip="Clamps the forces. Use in conjonction with max. velocity and friction"
                    min={0.001} max={3} step={0.001}
                    value={config.physics.maxForce} paramName="maxForce" onChange={handleParamChange}
                />
                <Slider
                    label="Max. velocity" tooltip="Clamps the velocity"
                    min={0.001} max={3} step={0.001}
                    value={config.physics.maxVelocity} paramName="maxVelocity" onChange={handleParamChange}
                />
                <Slider
                    label="Separation distance" tooltip="Distance under which the particles repel one another"
                    min={0.01} max={16} step={0.001}
                    value={config.physics.separationDistance} paramName="separationDistance" onChange={handleParamChange}
                />
                <Slider
                    label="Attraction distance" tooltip="Distance under which the particles apply the attraction matrix"
                    min={0.01} max={32} step={0.001}
                    value={config.physics.attractionDistance} paramName="attractionDistance" onChange={handleParamChange}
                />
                <Slider
                    label="Separation force" tooltip="Separation importance on total forces"
                    min={0.001} max={1} step={0.001}
                    value={config.physics.separationForce} paramName="separationForce" onChange={handleParamChange}
                />
                <Slider 
                    label="Attraction force" tooltip="Attraction/repulsion importance on total forces"
                    min={0.001} max={1} step={0.001}
                    value={config.physics.attractionForce} paramName="attractionForce" onChange={handleParamChange}
                />
                <Slider
                    label="Attraction attack" tooltip="Curve tuning. See curve graphic"
                    min={0.5} max={3} step={0.001}
                    value={config.physics.attractionAttack} paramName="attractionAttack" onChange={handleParamChange}
                />
                <Slider
                    label="Attraction decay" tooltip="Curve tuning. See curve graphic"
                    min={0.5} max={3} step={0.001}
                    value={config.physics.attractionDecay} paramName="attractionDecay" onChange={handleParamChange}
                />
                <Slider 
                    label="Attraction gain" tooltip="Curve tuning. See curve graphic"
                    min={0.5} max={5} step={0.001}
                    value={config.physics.attractionGain} paramName="attractionGain" onChange={handleParamChange}
                />
                <Slider
                    label="Separation power" tooltip="Curve tuning. See curve graphic"
                    min={0.1} max={12} step={0.001}
                    value={config.physics.separationPower} paramName="separationPower" onChange={handleParamChange}
                />
                <button className="btn btn-neutral mt-2 btn-sm" onClick={handleRandomizePositions}>Randomize particles positions</button>
                <button className="btn btn-neutral mt-2 btn-sm" onClick={handleRandomizeSliders}>Randomize sliders</button>
            </Collapsable>
            <CurveOutput isOpen={isOpen} />
        </>
    )
}