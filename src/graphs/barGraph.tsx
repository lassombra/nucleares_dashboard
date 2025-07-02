'use client';
import { RGBColor, HSLColor } from 'd3-color';
import useDimensions from "@/graphs/useDimensions";
import {RefObject} from "react";
import BarGraphContent from "@/graphs/barGraphContent";

export type HistoryDataPoint = {
    secondsSinceStart: number;
    data: number;
}

export type BarGraphProps = {
    history: HistoryDataPoint[];
    label: string;
    color: RGBColor | HSLColor | null;
    line1?: HistoryDataPoint[];
}
export function BarGraph(props: BarGraphProps) {
    const [ref, dimensions] = useDimensions() as [RefObject<HTMLDivElement>, { width: number, height: number }];
    return <div ref={ref} className="overflow-hidden">
        <svg style={{border: '1px solid gold'}} width={dimensions.width} height={dimensions.height}>
            <BarGraphContent history={props.history} line1={props.line1} color={props.color} width={dimensions.width} height={dimensions.height} />
        </svg>
    </div>
}