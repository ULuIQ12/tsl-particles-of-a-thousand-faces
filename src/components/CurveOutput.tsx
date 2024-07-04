interface CurveOutputProps {
    isOpen: boolean,
}

export default function CurveOutput({
    isOpen
}: CurveOutputProps) {
    return (
        <div className={isOpen ? 'block' : 'hidden'}>
            <div className="w-[420px] h-48 rounded-2xl z-10">
                <div className="flex flex-col">
                    <div className="flex flex-row h-12 ">
                        <div className="bg-base-200 rounded-tl-2xl flex-none w-4"></div>
                        <div className="bg-base-200 flex-1">
                            <div className="flex flex-row justify-start items-center h-full">
                                <div className="text-lg font-medium">Attraction curve shape</div>
                            </div>
                        </div>
                        <div className="bg-base-200 rounded-tr-2xl flex-none w-4"></div>
                    </div>
                    <div className="flex flex-row h-32 grow">
                        <div className="bg-base-200 w-4 "></div>
                        {/* This is the curve output reference element, drawn in the context3D and placed here */}
                        <div id="curve-element" className="bg-base-500 grow"></div>
                        <div className="bg-base-200 w-4"></div>
                    </div>
                    <div className="flex flex-row h-4">
                        <div className="bg-base-200 rounded-bl-2xl flex-none w-4"></div>
                        <div className="bg-base-200 flex-1"></div>
                        <div className="bg-base-200 rounded-br-2xl flex-none w-4"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}