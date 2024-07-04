import gsap from 'gsap';
import styles from './MatrixEditor.module.css';
import { useEffect, useRef, useState } from 'react';

interface IMatrixCellButtonProps {
    value: number,
    index: number,
    onValueChange?: (index: number, value: number) => void
}
export default function MatrixCellButton({
    value,
    index,
    onValueChange,
}: IMatrixCellButtonProps) {


    const eventStartLoc = useRef({ x: 0, y: 0 });
    const elRef = useRef<HTMLButtonElement>(null);


    useEffect(() => {
        gsap.to(elRef.current, {
            backgroundColor: gsap.utils.interpolate("#3286ff", "#ff1f70", value * .5 + .5),
            duration: .1,
            ease: "power2.inOut"
        });
    }, [value]);

    const handlePointerDown = (event: React.PointerEvent) => {
        eventStartLoc.current = { x: event.clientX, y: event.clientY };
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
    }

    const handlePointerMove = (event: PointerEvent) => {
        const deltaX = event.clientX - eventStartLoc.current.x;
        const newValue = Math.min(1, Math.max(-1, value + deltaX * .01));
        onValueChange?.(index, newValue);
    }

    const handlePointerUp = (event: PointerEvent) => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
    }

    return (
        <div className='tooltip' data-tip='click&drag left/right to modify value'>
            <button
                ref={elRef}
                className={styles.GridCell}
                onPointerDown={handlePointerDown}
            >
                {value.toFixed(2)}

            </button>
        </div>
    );
}