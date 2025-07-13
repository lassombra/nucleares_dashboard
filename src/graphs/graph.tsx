'use client';
import { RGBColor, HSLColor } from 'd3-color';
import useDimensions from "@/graphs/useDimensions";
import {RefObject} from "react";
import {scaleLinear, scaleTime} from "d3";
import LeftAxis from "@/graphs/leftAxis";
import TimeAxis from "@/graphs/timeAxis";
import RightAxis from "@/graphs/rightAxis";
import StackedBars from "@/graphs/stackedBars";
import Lines from "@/graphs/Lines";
import Label, {LabelValue} from "@/graphs/Label";

export type HistoryDataPoint = {
    minutesSinceStart: number;
    bars: number[];
    lines: LineDataPoint[]; // data points for the line graph
}

export type LineDataPoint = {
    data: number;
    axisIndex: number; // index of the axis this data point belongs to for determining height
}

export type ColorOptions = {
    barColors: (RGBColor | HSLColor)[];
    lineColors?: (RGBColor | HSLColor)[];
}

export type BarGraphProps = {
    history: HistoryDataPoint[];
    axes: [number, number][];
    barAxisIndex: number; // index of the axis for the bar graph
    rightAxis: boolean; // if true, axes[1] will be drawn for the right axis
    color: ColorOptions;
    label: string;
    labelValues: LabelValue[];
}

function optimizeAxis(range: [number, number], domain: [number, number]): [number, number] {
    const maxTicks = Math.min(10, Math.abs(Math.ceil((range[0] - range[1]) / 100))); // max 10 ticks, each at least 50px apart
    const providedMin = Math.floor(domain[0] * 100) / 100; // round to 2 decimal places
    const providedMax = Math.ceil(domain[1] * 100) / 100; // round to 2 decimal places
    const scale = scaleLinear()
        .domain([providedMin, providedMax])
        .range(range)
        .nice(maxTicks);
    return scale.domain() as [number, number]; // return the optimized domain
}

/// <summary>
/// Calculates the axes for the bar graph based on the history data and dimensions.
/// </summary>
export function Graph(props: BarGraphProps) {
    const [ref, dimensions] = useDimensions() as [RefObject<HTMLDivElement>, { width: number, height: number }];
    const hasRightAxis = props.rightAxis;
    const rightMargin = hasRightAxis ? 80 : 20;
    const leftMargin = 80;
    const topMargin = 20;
    const bottomMargin = 50;
    const axisRange = [dimensions.height - bottomMargin, topMargin] as [number, number];
    const timeAxis = scaleTime()
        .domain([new Date(props.history[0].minutesSinceStart * 60_000), new Date(props.history[props.history.length - 1].minutesSinceStart * 60_000)])
        .range([leftMargin, dimensions.width - rightMargin]);
    const axes = props.axes.map(axis => optimizeAxis(axisRange, axis));
    return <div className="flex flex-col overflow-hidden">
        <Label label={props.label} values={props.labelValues} />
        <div className="flex-1 h-full overflow-hidden" ref={ref}>
            <svg style={{border: '1px solid gold'}} width={dimensions.width} height={dimensions.height}>
                <LeftAxis domain={axes[0]} range={axisRange} />
                <TimeAxis width={dimensions.width} height={dimensions.height} domain={timeAxis.domain()}
                          range={timeAxis.range()} y={axisRange[0]} />
                {hasRightAxis && axes[1] ? <RightAxis domain={axes[1]} range={axisRange}
                                                        left={timeAxis.range()[1]} /> : null}
                {props.history[0].bars.length > 0 && <StackedBars history={props.history} colors={props.color} timeRange={timeAxis.range()}
                             timeDomain={timeAxis.domain()} range={axisRange} domain={axes[props.barAxisIndex]} />}
                {props.history[0].lines.length > 0 && <Lines history={props.history} colors={props.color} axes={axes} axisRange={axisRange}
                                timeRange={timeAxis.range() as [number, number]} timeDomain={timeAxis.domain() as [Date, Date]} />}
            </svg>
        </div>
    </div>
}