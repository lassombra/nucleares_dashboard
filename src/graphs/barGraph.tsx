'use client';
import { RGBColor, HSLColor } from 'd3-color';
import useDimensions from "@/graphs/useDimensions";
import {RefObject} from "react";
import {extent, ScaleLinear, scaleLinear, scaleTime} from "d3";
import LeftAxis from "@/graphs/leftAxis";
import TimeAxis from "@/graphs/timeAxis";
import RightAxis from "@/graphs/rightAxis";
import BarGraphRender from "@/graphs/barGraphRender";

export type HistoryDataPoint = {
    secondsSinceStart: number;
    data: number;
    data2?: number; // second data point for overlayed line graph or stacked bar graph
    data3?: number;
    data4?: number;
}

export type ColorOptions = {
    mainColor: RGBColor | HSLColor;
    secondaryColor?: RGBColor | HSLColor;
    tertiaryColor?: RGBColor | HSLColor;
    quaternaryColor?: RGBColor | HSLColor;
}

export enum SecondaryGraphType {
    None = 'none',
    Line = 'line', // overlayed line graph
    StackedBar = 'stacked-bar', // stacked bar graph
}

export enum SecondaryAxisSource {
    None = 'none',
    data2 = 'data2', // use data2 for secondary axis
    data3 = 'data3', // use data3 for secondary axis
    data4 = 'data4', // use data4 for secondary axis
}

export type BarGraphProps = {
    history: HistoryDataPoint[];
    secondaryGraphType: SecondaryGraphType; // type of secondary graph to overlay
    secondaryAxisSource: SecondaryAxisSource; // source of secondary axis data
    color: ColorOptions;
    label: string;
}

/// <summary>
/// Calculates the axes for the bar graph based on the history data and dimensions.
/// </summary>
function calcAxes(history: HistoryDataPoint[], height: number, useSumRange = false): ScaleLinear<number, number, never>[] {
    const mainDomain = extent(history, d => useSumRange ? (d.data + (d.data2 ?? 0) + (d.data3 ?? 0) + (d.data4 ?? 0)) : d.data) as [number, number];
    if (useSumRange) {
        mainDomain[0] = Math.min(
            extent(history, d => d.data)[0] as number,
            extent(history, d => d.data2 ?? Infinity)[0] as number,
            extent(history, d => d.data3 ?? Infinity)[0] as number,
            extent(history, d => d.data4 ?? Infinity)[0] as number);
    }
    const result = [scaleLinear()
        .domain(mainDomain)
        .range([height + 20, 20])
        .nice()];
    if (history[0].data2 !== undefined && !useSumRange) {
        result.push(scaleLinear()
            .domain(extent(history, d => d.data2 ?? 0) as [number, number])
            .range([height + 20, 20])
            .nice());
    }
    if (history[0].data3 !== undefined && !useSumRange) {
        result.push(scaleLinear()
            .domain(extent(history, d => d.data3 ?? 0) as [number, number])
            .range([height + 20, 20])
            .nice());
    }
    if (history[0].data4 !== undefined && !useSumRange) {
        result.push(scaleLinear()
            .domain(extent(history, d => d.data4 ?? 0) as [number, number])
            .range([height + 20, 20])
            .nice());
    }
    return result;
}

export function BarGraph(props: BarGraphProps) {
    const [ref, dimensions] = useDimensions() as [RefObject<HTMLDivElement>, { width: number, height: number }];
    const hasSecondaryAxis = props.secondaryAxisSource !== SecondaryAxisSource.None;
    const rightMargin = hasSecondaryAxis ? 80 : 20;
    const leftMargin = 80;
    const topMargin = 20;
    const bottomMargin = 50;
    const height = dimensions.height - topMargin - bottomMargin;
    const axes = calcAxes(props.history, height, props.secondaryGraphType === SecondaryGraphType.StackedBar);
    const timeAxis = scaleTime()
        .domain([new Date(props.history[0].secondsSinceStart * 1000), new Date(props.history[props.history.length - 1].secondsSinceStart * 1000)])
        .range([leftMargin, dimensions.width - rightMargin]);
    const secondaryAxis = (() => {
        switch (props.secondaryAxisSource) {
            case SecondaryAxisSource.data2:
                return axes[1];
            case SecondaryAxisSource.data3:
                return axes[2];
            case SecondaryAxisSource.data4:
                return axes[3];
            default:
                return axes[0];
        }
    })()
    return <div className="flex flex-col overflow-hidden">
        <h2 className="text-gray-500 font-bold text-2xl">{props.label}</h2>
        <div ref={ref} className="overflow-hidden h-full">
        <svg style={{border: '1px solid gold'}} width={dimensions.width} height={dimensions.height}>
            <LeftAxis domain={axes[0].domain()} range={axes[0].range()} />
            <TimeAxis width={dimensions.width} height={dimensions.height} domain={timeAxis.domain()} range={timeAxis.range()} y={axes[0].range()[0]} />
            {hasSecondaryAxis ? <RightAxis domain={secondaryAxis.domain()} range={secondaryAxis?.range()} left={timeAxis.range()[1]} /> : null}
            <BarGraphRender history={props.history} axes={{
                primary: { domain: axes[0].domain(), range: axes[0].range() },
                secondary: axes[1] ? { domain: secondaryAxis.domain(), range: secondaryAxis.range() } : undefined,
                tertiary: axes[2] ? { domain: axes[2].domain(), range: axes[2].range() } : undefined,
                quaternary: axes[3] ? { domain: axes[3].domain(), range: axes[3].range() } : undefined,
                time: { domain: timeAxis.domain(), range: timeAxis.range() }
            }}
                secondaryGraphType={props.secondaryGraphType}
                colors={props.color} />
        </svg>
    </div>
    </div>
}