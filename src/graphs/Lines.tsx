import {ColorOptions, HistoryDataPoint} from "@/graphs/barGraph";
import {AxisData} from "@/graphs/barGraphRender";
import {ScaleLinear, scaleLinear, ScaleTime, scaleTime} from "d3";
import {Fragment} from "react";

export type LinesProps = {
    history: HistoryDataPoint[];
    colors: ColorOptions;
    axes: AxisData;
}


function createLines(history: HistoryDataPoint[], i: number, colors: ColorOptions, timeScale: ScaleTime<number, number, never>,
                     secondaryScale: ScaleLinear<number, number, never> | null, tertiaryScale: ScaleLinear<number, number, never> | null,
                     quaternaryScale: ScaleLinear<number, number, never> | null) {
    if (i === 0) {
        return null;
    }
    const previousPoint = history[i - 1];
    return <Fragment key={i}>
        {secondaryScale && previousPoint.data2 !== undefined && history[i].data2 !== undefined &&
            <line x1={timeScale(new Date(previousPoint.secondsSinceStart * 1000))}
                  y1={secondaryScale(previousPoint.data2)}
                  x2={timeScale(new Date(history[i].secondsSinceStart * 1000))}
                  y2={secondaryScale(history[i].data2)}
                    stroke={colors.secondaryColor?.toString() ?? "black"}
                    strokeWidth="2" />}
        {tertiaryScale && previousPoint.data3 !== undefined && history[i].data3 !== undefined &&
            <line x1={timeScale(new Date(previousPoint.secondsSinceStart * 1000))}
                  y1={tertiaryScale(previousPoint.data3)}
                  x2={timeScale(new Date(history[i].secondsSinceStart * 1000))}
                  y2={tertiaryScale(history[i].data3)}
                  stroke={colors.secondaryColor?.toString() ?? "black"}
                  strokeWidth="2" />}
        {quaternaryScale && previousPoint.data4 !== undefined && history[i].data4 !== undefined &&
            <line x1={timeScale(new Date(previousPoint.secondsSinceStart * 1000))}
                  y1={quaternaryScale(previousPoint.data4)}
                  x2={timeScale(new Date(history[i].secondsSinceStart * 1000))}
                  y2={quaternaryScale(history[i].data4)}
                  stroke={colors.secondaryColor?.toString() ?? "black"}
                  strokeWidth="2" />}
    </Fragment>
}

export default function Lines(props: LinesProps) {
    const timeScale = scaleTime()
        .domain(props.axes.time.domain)
        .range(props.axes.time.range);
    const secondaryScale = props.axes.secondary ? scaleLinear()
        .domain(props.axes.secondary.domain)
        .range(props.axes.secondary.range) : null;
    const tertiaryScale = props.axes.tertiary ? scaleLinear()
        .domain(props.axes.tertiary.domain)
        .range(props.axes.tertiary.range) : null;
    const quaternaryScale = props.axes.quaternary ? scaleLinear()
        .domain(props.axes.quaternary.domain)
        .range(props.axes.quaternary.range) : null;
    return <svg>
        {props.history.map((point, i) => createLines(props.history, i, props.colors, timeScale, secondaryScale, tertiaryScale, quaternaryScale))}
    </svg>
}