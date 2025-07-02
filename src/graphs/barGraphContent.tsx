'use client';
import {HSLColor, RGBColor} from "d3-color";
import {HistoryDataPoint} from "@/graphs/barGraph";
import {scaleTime, scaleLinear, extent, ScaleTime, ScaleLinear, color} from 'd3';
import TimeAxis from "@/graphs/timeAxis";
import LeftAxis from "@/graphs/leftAxis";
import RightAxis from "@/graphs/rightAxis";

export type BarGraphContentProps = {
    history: HistoryDataPoint[];
    line1?: HistoryDataPoint[];
    color: RGBColor | HSLColor | null;
    width: number;
    height: number;
}

function createLine(
    history: HistoryDataPoint[],
    index: number,
    x: ScaleTime<number, number, never>,
    y: ScaleLinear<number, number, never>,
    color: RGBColor | HSLColor | null
) {
    if (index == 0) {
        return null;
    }
    const start = history[index - 1];
    const end = history[index];
    return <line x1={x(new Date((start.secondsSinceStart * 1000)))}
            y1={y(start.data)}
            x2={x(new Date((end.secondsSinceStart * 1000)))}
            y2={y(end.data)}
            width="1"
            stroke={color?.formatHex() ?? 'black'} />
}

function createBar(
    history: HistoryDataPoint[],
    index: number,
    x: ScaleTime<number, number, never>,
    y: ScaleLinear<number, number, never>,
    color: RGBColor | HSLColor | null,
) {
    const left = Math.max(x(new Date((history[index].secondsSinceStart * 1000)-500)), x.range()[0]);
    let right;
    if (index < history.length - 1) {
        right = x(new Date((history[index + 1].secondsSinceStart * 1000)-500));
    } else {
        right = x(new Date((history[index].secondsSinceStart + 0.5) * 1000));
    }
    right = Math.min(right, x.range()[1]);
    const top = y(history[index].data);
    const bottom = y(y.domain()[0]);
    return <rect x={left} y={top} width={right - left} height={bottom - top}
            fill={color?.formatHex() ?? 'black'} key={index}/>
}

export default function BarGraphContent(props: BarGraphContentProps) {
    const timeRange = extent(props.history, d => d.secondsSinceStart) as [number, number];
    timeRange[1] = timeRange[1];
    const marginRight = props.line1 ? 60 : 20;
    const x = scaleTime()
        .domain(timeRange.map(d => new Date(d * 1000)) as [Date, Date])
        .range([60, props.width - marginRight]);
    const y = scaleLinear()
        .domain(extent(props.history, d => d.data) as [number, number])
        .range([props.height - 60, 20]);
    const lineScale = scaleLinear()
        .domain(extent(props.line1 || props.history, d => Math.round(d.data*100)/100) as [number, number])
        .range([props.height - 60, 20])
        .nice();
    const range = y.domain()[1] - y.domain()[0];
    y.domain([y.domain()[0] - range * .1, y.domain()[1] + range *.1]);
    y.nice();
    return <svg>
        <g>
        {props.history.map((d, i) =>
            createBar(props.history, i, x, y, props.color)
        )}
        </g>
        {props.line1 ? <g>
            {props.line1.map((d, i) =>
                createLine(props.line1 as HistoryDataPoint[], i, x, lineScale, color("red"))
            )}
        </g> : null}
        <LeftAxis domain={y.domain()} range={y.range()} />
        <TimeAxis y={props.height - 60} width={props.width} height={props.height} domain={x.domain()} range={x.range()} />
        {props.line1 ? <RightAxis domain={lineScale.domain()} range={lineScale.range()} left={x.range()[1]} /> : null}
    </svg>
}