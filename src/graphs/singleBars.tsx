import {HistoryDataPoint} from "@/graphs/barGraph";
import {HSLColor, RGBColor} from "d3-color";
import {ScaleLinear, scaleLinear, ScaleTime, scaleTime} from "d3";

export type SingleBarProps = {
    history: HistoryDataPoint[];
    color: RGBColor | HSLColor;
    timeRange: number[]; // [start, end] in seconds
    timeDomain: Date[];
    range: number[]; // [min, max] in pixels
    domain: number[]; // [min, max] in data units
}

function endTime(history: HistoryDataPoint[], i: number) {
    if (i === history.length - 1) {
        return history[i].secondsSinceStart * 1000; // last bar ends at its own time
    }
    return (history[i + 1].secondsSinceStart * 1000) - 500; // next bar starts at its own time minus 500ms
}

function calcRectangleDimensions(history: HistoryDataPoint[], i: number, timeScale: ScaleTime<number, number, never>, rangeScale: ScaleLinear<number, number, never>) {
    const x = timeScale(new Date((history[i].secondsSinceStart * 1000) - (i === 0 ? 0 : 500))); // get left position of the bar at - 500ms except for the first bar
    const y = rangeScale(history[i].data); // get the top position of the bar based on the data value
    const height = rangeScale.range()[0] - y;
    const width = timeScale(endTime(history, i)) - x;
    return {x, y, width, height};
}

export default function SingleBars(props: SingleBarProps) {
    const timeScale = scaleTime()
        .domain(props.timeDomain)
        .range(props.timeRange);
    const rangeScale = scaleLinear()
        .domain(props.domain)
        .range(props.range);
    const rectangleDims = props.history.map((point, i) =>
        calcRectangleDimensions(props.history, i, timeScale, rangeScale));
    return <svg>
        {props.history.map((point, i) => {
            const thisRectDims = rectangleDims[i];
            return <rect
                key={i}
                x={thisRectDims.x}
                y={thisRectDims.y}
                width={thisRectDims.width}
                height={thisRectDims.height}
                fill={props.color.toString()}
            />;
        })}
    </svg>
}