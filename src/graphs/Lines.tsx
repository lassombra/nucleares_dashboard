import {ColorOptions, HistoryDataPoint} from "@/graphs/graph";
import {ScaleLinear, scaleLinear, ScaleTime, scaleTime} from "d3";
import {Fragment} from "react";

export type LinesProps = {
    history: HistoryDataPoint[];
    colors: ColorOptions;
    timeRange: [number,number]; // [start, end] in seconds
    timeDomain: [Date, Date]; // [start, end] in Date objects
    axisRange: [number, number]; // [min, max] in pixels
    axes: [number, number][]; // [min, max] for each axis
}


function createLines(history: HistoryDataPoint[], i: number, colors: ColorOptions, timeScale: ScaleTime<number, number, never>,
                     scales: ScaleLinear<number, number>[]) {
    if (i === 0) {
        return null;
    }
    const previousPoint = history[i - 1];
    const point = history[i];
    return <Fragment key={i}>
        {point.lines.map((line, index) => {
            const scale = scales[line.axisIndex];
            if (scale === undefined) {
                return null; // skip if no scale for this line
            }
            return <line key={index}
                         x1={timeScale(new Date(previousPoint.minutesSinceStart * 60_000))}
                         y1={scale(previousPoint.lines[index].data)}
                         x2={timeScale(new Date(point.minutesSinceStart * 60_000))}
                         y2={scale(point.lines[index].data)}
                         stroke={colors.lineColors?.[index % colors.lineColors.length]?.toString() ?? "black"}
                         strokeWidth="6" />;
        })}
    </Fragment>
}

export default function Lines(props: LinesProps) {
    const timeScale = scaleTime()
        .domain(props.timeDomain)
        .range(props.timeRange);
    const scales = props.axes.map(axis => scaleLinear()
        .domain(axis)
        .range(props.axisRange));
    return <svg>
        {props.history.map((point, i) => createLines(props.history, i, props.colors, timeScale, scales))}
    </svg>
}