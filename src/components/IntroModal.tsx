import { useEffect, useState } from "react";
import WebGPU from "three/examples/jsm/capabilities/WebGPU.js";
import { questionIcon, tools } from "./GFX";

interface IIntroModalProps {
    onClose?: () => void;
}

export default function IntroModal({
    onClose,
}: IIntroModalProps) {

    const [isOpen, setIsOpen] = useState(true);
    const handleOpenCloseChange = () => {
        setIsOpen(!isOpen);
        if (onClose) {
            onClose();
        }
    }

    const [hasWebGPU, setHasWebGPU] = useState(false);
    useEffect(() => {
        setHasWebGPU(WebGPU.isAvailable())
    }, []);

    return (
        <>    
            <dialog id="intro-modal" className="modal modal-bottom sm:modal-middle ">
            <div className="modal-box">
                <div className="font-bold text-lg">Hello!</div>
                { hasWebGPU && 
                    <div className="pt-4 flex flex-col text-justify">
                    
                        <div className="pb-2">Welcome to "Particles of a thousand faces", a toy designed while experimenting with the Three Shading Language.</div>
                        <div className="pb-2 flex-row">The drawer accessible by clicking the <b><span className="inline-flex h-4 w-4 mx-1">{tools()}</span> button</b> in the top left contains all the settings to tweak the simulation.</div>
                        <div className="pb-2 flex-row">Access more infos by clicking the <b>? button</b>, also in the top left.</div>
                        <div className="pb-2">
                            <div className="text-lg">Controls</div>
                            <li>Left click to interact with the particles</li>
                            <li>Right click pan the viewport</li>
                            <li>Wheel to zoom</li>
                        </div>
                        
                        <div className="pb-2">Play with the sliders, click the buttons, and Have fun!</div>
                    
                    </div>
                }
                { !hasWebGPU && 
                    <div className="py-4 flex flex-col">
                        <div className="pb-2"><a className="link" href="https://gpuweb.github.io/gpuweb/">WebGPU</a> is not available on your browser. The simulation will not work.</div>
                        <div className="pb-2">Please try with a WebGPU compatible browser, like Chrome or Edge.</div>
                    </div>
                }
                <div className="modal-action justify-center">
                    <form method="dialog">
                        <button className="btn btn-neutral w-80" onClick={handleOpenCloseChange}>OK, I will</button>
                    </form>
                </div>
            </div>
            </dialog>
            
        </>
    )
}

