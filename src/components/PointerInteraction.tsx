import { useState } from "react";
import PLConfig from "../lib/elements/particlesLife/PLConfig";
import Collapsable from "./Collapsable";
import Slider from "./Slider";

interface IPointerInteractionProps {
    config: PLConfig
    onParamChange: (paramName: string, value: number) => void;
}

export default function PointerInteraction({
    config,
    onParamChange,
}: IPointerInteractionProps) {

    const handleStrengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        onParamChange("strength", value);
    }

    const handleAttractionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        onParamChange("attraction", value);
    }

    const handleRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        onParamChange("range", value);
    }        

    return (
        <Collapsable title="Pointer interaction">
            <Slider 
                label="Attraction factor" tooltip="Can be positive or negative."
                min={-1} max={1} step={0.001} value={config.pointer.attraction} paramName="attraction" onChange={handleAttractionChange}
            />
            <Slider 
                label="Strength" tooltip="The strength of the interaction."
                min={0} max={10} step={0.001} value={config.pointer.strength} paramName="strength" onChange={handleStrengthChange}
            />
            <Slider
                label="Range" tooltip="Distance from the pointer where the interaction starts to take effect."
                min={0} max={32} step={0.001} value={config.pointer.range} paramName="range" onChange={handleRangeChange}
            />
        </Collapsable>
    )
};