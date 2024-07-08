import { useEffect, useState } from "react";
import Collapsable from "./Collapsable";

interface IConfigPresetsProps {
    onLoadRequest: (preset: string) => void;
}

export default function ConfigPresets({
    onLoadRequest,
}: IConfigPresetsProps) {

    const [presetFiles, setPresetFiles] = useState<string[]>([]);
    const [selectedPreset, setSelectedPreset] = useState<string>("");

    const getPresetFolderContent = () => {
        
        if (import.meta.env.MODE === 'development') {
            const data = [
                "lifelike",
                "colorful_chasers",
                "small_lines",
                "blobby_liquid",
                "hexa_worms",
                "turbulent_clown",
                "painterly_chasers",
                "cells",
                "tri_cells",
                "mondrianflow",
                "cga_mosaic"
            ];
            setPresetFiles(data);
            setSelectedPreset(data[0]);
        }
        else 
        {
            const grabScriptURL:string = './presets/presets.php';
            fetch(grabScriptURL)
            .then(response => response.json())
            .then(data => {
                setPresetFiles(data);
                setSelectedPreset(data[0]);
            });
        }
    }

    useEffect(() => {
        getPresetFolderContent();
    }, []);

    const presetOptions = () => {
        return presetFiles.map((file) => {
            return <option key={file} value={file}>{file}</option>
        });
    }

    const handleLoadClick = () => {
        console.log("Load preset", selectedPreset);
        const presetURL:string = `./presets/${selectedPreset}.json`;
        fetch(presetURL)
        .then(response => response.json())
        .then(data => {
            onLoadRequest(data);
        });
    }

    return (
        <Collapsable title="Configuration presets">
            <div className="slider px-1" >
                <div className="sliderLabel">Select preset</div>
                { presetFiles.length === 0 && <div className="text-xs text-base-300">Loading...</div>}
                { presetFiles.length>0 &&
                    <select className="select select-bordered select-sm w-full" value={selectedPreset} onChange={(event) => {setSelectedPreset(event.target.value)}}>
                        {presetOptions()}
                    </select>
                }
                
            </div>
            <button className="btn btn-neutral mt-2 btn-sm" onClick={handleLoadClick}>Load preset</button>
        </Collapsable>
    )
}