'use client';
import {RefObject, useEffect, useRef, useState} from "react";

export default function useDimensions(): [RefObject<HTMLElement | null>, {width: number, height: number}] {
    const ref = useRef<HTMLElement>(null);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        const currentRef = ref.current;
        let currentWidth = 0;
        let currentHeight = 0;
        const resizeObserver = new ResizeObserver(entries => {
            if (!Array.isArray(entries)) return
            if (!entries.length) return
            const entry = entries[0]
            const [rectWidth, rectHeight] = getDimensions(entry);
            if (rectWidth !== currentWidth || rectHeight !== currentHeight) {
                setWidth(rectWidth);
                setHeight(rectHeight);
                currentWidth = rectWidth;
                currentHeight = rectHeight;
            }
        });
        if (currentRef) {
            resizeObserver.observe(currentRef)
            return () => {
                resizeObserver.unobserve(currentRef);
            };
        }
    }, [ref])
    return [ref, {width, height}];
}

function getDimensions (ref: ResizeObserverEntry): [number, number] {
    return [ref.contentRect.width, ref.contentRect.height];
}