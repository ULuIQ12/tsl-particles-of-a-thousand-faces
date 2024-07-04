import { useState } from "react";
import Collapsable from "./Collapsable";
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


    const handleOpenCloseChange = () => {
        onClose();
    }

    return (
        <>
            <dialog id="info-modal" className="modal">
                <div className="modal-box w-11/12 max-w-5xl">
                    <div className="font-bold text-lg pb-4 w-full flex row  items-center justify-between">
                        <div>Info / Help</div>
                        <button className="btn btn-neutral btn-circle drawer-button mb-2" onClick={handleOpenCloseChange}>{closeCross()}</button>
                    </div>
                    <div className="flex flex-col gap-2 justify-end">
                        <LargeCollapsable title="About" accordionName="info">
                            ABOUT !
                        </LargeCollapsable>
                        <LargeCollapsable title="Controls" accordionName="info">
                            Controls !
                        </LargeCollapsable>
                        <LargeCollapsable title="How it works" accordionName="info">
                            How it works !
                        </LargeCollapsable>
                        <LargeCollapsable title="Links" accordionName="info">
                            <div className="flex flex-col gap-1">
                                <a className="link">I'm a simple link</a>
                                <a className="link">I'm a simple link</a>
                                <a className="link">I'm a simple link</a>
                                <a className="link">I'm a simple link</a>
                            </div>
                        </LargeCollapsable>
                    </div>
                </div>
            </dialog>

        </>
    )
}