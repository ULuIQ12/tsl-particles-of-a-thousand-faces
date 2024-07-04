import { useRef, useState } from "react";
import { ParticlesLife } from "../lib/elements/ParticlesLife";
import { Palettes } from "../lib/elements/particlesLife/PLPalette";
import PLConfig from "../lib/elements/particlesLife/PLConfig";
import Collapsable from "./Collapsable";
import Slider from "./Slider";

interface IAppearanceProps {
    config: PLConfig
    onParamChange: (paramName: string, value: string | number | boolean) => void;
    onPaletteUpdate: () => void;
    onCustomChange: (type:string, value: number, index?:number) => void;
    
}

export default function Apparence({
    config,
    onParamChange,
    onCustomChange

}: IAppearanceProps) {

    const handlePartSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value:number = parseFloat(event.target.value);
        onParamChange("particleSize", value);

    };
    const handlePartSmoothnessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value:number = parseFloat(event.target.value);
        onParamChange("particleSmoothness", value);
    }

    const handleVelToSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value:boolean = event.target.checked;
        onParamChange("velToSize", value);
    }

    const handleVelToAlphaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value:boolean = event.target.checked;
        onParamChange("velToAlpha", value);
    }

    const handleOrientToVelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value:boolean = event.target.checked;
        onParamChange("orientToVel", value);
    }

    const handleMakeAnularChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value:boolean = event.target.checked;
        onParamChange("makeAnular", value);
    }

    const shapes = [
        "Circle",
        "Rounded X",
        "Hexagon",
        "Cross",
        "Moon",
        "Horizontal Rect.",
        "Vertical Rect.",
        "Horizontal Line",
        "Vertical Line",
    ]

    const handleShapeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value:string = event.target.value;
        onParamChange("shape", shapes.indexOf(value));
    }

    const handlePaletteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value:string = event.target.value;
        onParamChange("palette", value);
    }

    const handleAdditiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value:boolean = event.target.checked;
        onParamChange("additive", value);
    }

    const handleCustomColorChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value.substr(1), 16);
        onCustomChange("color", value, index);
    }
    const handleCustomBgColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value.substr(1), 16);
        onCustomChange("background", value);
    }
    const handleCustomFrameColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value.substr(1), 16);
        onCustomChange("frame", value);
    }


    return (
        <Collapsable title="Appearance">        
            <div className="slider" >
                <div className="sliderLabel">Palette</div>
                <select className="select select-bordered select-sm w-full mb-4" value={config.appearance.palette} onChange={handlePaletteChange}>
                    {
                        Object.keys(Palettes).map((s, index) => (
                            <option key={index}>{s}</option>
                        ))
                    }
                    <option key={Object.keys(Palettes).length+1}>Custom</option>
                </select>
            </div>
            <div className={( (config.appearance.palette as string).toLowerCase() === "custom")?"":"hidden"}>
                <div>Particles colors </div>
                <div className={"flex flex-row justify-between w-full pb-2"}>
                    { 
                        Array.from({length: 8}).map((_, index) => (                          
                            <input key={index} type="color" className="w-8 h-8 bg-transparent" 
                            value={"#" + config.appearance.customColors[index].toString(16).padStart(6, "0")}
                            onChange={handleCustomColorChange(index)}
                            />
                        ))
                    }
                </div>
                <div className="flex flex-row justify-between w-full pb-4">
                    <div className="flex flex-row items-center gap-2">
                        <div>Background color</div>
                        <input type="color" className="w-8 h-8 bg-transparent" value={"#" + config.appearance.customBackgroundColor.toString(16).padStart(6, "0")} 
                        onChange={handleCustomBgColorChange}/>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <div>Frame color</div>
                        <input type="color" className="w-8 h-8 bg-transparent" value={"#" + config.appearance.customFrameColor.toString(16).padStart(6, "0")} 
                        onChange={handleCustomFrameColorChange}/>
                    </div>
                </div>
            </div>
            <div className="slider" >
                <div className="sliderLabel">Particles shape</div>
                <select className="select select-bordered select-sm w-full mb-4" value={shapes[config.appearance.shape]} onChange={handleShapeChange}>
                    {
                        shapes.map((s, index) => (
                            <option key={index}>{s}</option>
                        ))
                    }
                </select>
            </div>
            <Slider 
                label="Part.size" 
                min={0} max={1} step={0.001}
                value={config.appearance.particleSize} paramName="particleSize" onChange={handlePartSizeChange}
            />
            <Slider 
                label="Part. smoothness"
                min={0} max={1} step={0.001}
                value={config.appearance.particleSmoothness} paramName="particleSmoothness" onChange={handlePartSmoothnessChange}
            />
            <label className="label cursor-pointer px-0 py-1">
                <span className="label-text">Velocity to size</span>
                <input type="checkbox" className="toggle" checked={config.appearance.velToSize} onChange={handleVelToSizeChange} />
            </label>
            <label className="label cursor-pointer px-0 py-1">
                <span className="label-text">Velocity to alpha</span>
                <input type="checkbox" className="toggle" checked={config.appearance.velToAlpha} onChange={handleVelToAlphaChange} />
            </label>
            <label className="label cursor-pointer px-0 py-1">
                <span className="label-text">Orient towards velocity</span>
                <input type="checkbox" className="toggle" checked={config.appearance.orientToVel} onChange={handleOrientToVelChange} />
            </label>
            <label className="label cursor-pointer px-0 py-1">
                <span className="label-text">Make shape anular</span>
                <input type="checkbox" className="toggle" checked={config.appearance.makeAnular} onChange={handleMakeAnularChange} />
            </label>
            <label className="label cursor-pointer px-0 py-1">
                <span className="label-text">Additive blending</span>
                <input type="checkbox" className="toggle" checked={config.appearance.additive} onChange={handleAdditiveChange} />
            </label>
        </Collapsable>
    )
}