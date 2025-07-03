import {ColorOptions, HistoryDataPoint} from "@/graphs/barGraph";
import {ScaleLinear, scaleLinear, ScaleTime, scaleTime} from "d3";
import {useDebugValue} from "react";

export type StackedBarProps = {
    history: HistoryDataPoint[];
    colors: ColorOptions;
    timeRange: number[]; // [start, end] in seconds
    timeDomain: Date[];
    range: number[]; // [min, max] in pixels
    domain: number[]; // [min, max] in data units
}

function calculateRectangles(history: HistoryDataPoint[], i: number, timeScale: ScaleTime<number, number, never>, rangeScale: ScaleLinear<number, number, never>, colors: ColorOptions) {
    const x = timeScale(new Date((history[i].secondsSinceStart * 1000) - (i === 0 ? 0 : 500))); // left position of the bar at - 500ms except for the first bar
    const width = timeScale(new Date(((history[i + 1]?.secondsSinceStart ?? history[i].secondsSinceStart) * 1000) - (i === history.length - 1 ? 0 : 500))) - x; // width based on the next point's time
    const result = [
        {
            x,
            y: rangeScale(history[i].data),
            width,
            height: rangeScale.range()[0] - rangeScale(history[i].data),
            color: colors.mainColor
        }
    ];
    if (history[i].data2 !== undefined) {
        const y =rangeScale(history[i].data + (history[i].data2 ?? 0))
        result.push({
            x,
            y,
            width,
            height: rangeScale(history[i].data) - y,
            color: colors.secondaryColor ?? colors.mainColor
        });
    }
    if (history[i].data3 !== undefined) {
        const y = rangeScale(history[i].data + (history[i].data2 ?? 0) + (history[i].data3 ?? 0));
        const y_b = rangeScale(history[i].data + (history[i].data2 ?? 0))
        result.push({
            x,
            y,
            width,
            height: y_b - y,
            color: colors.tertiaryColor ?? colors.mainColor
        });
    }
    if (history[i].data4 !== undefined) {
        const y = rangeScale(history[i].data + (history[i].data2 ?? 0) + (history[i].data3 ?? 0) + (history[i].data4 ?? 0))
        const y_b = rangeScale(history[i].data + (history[i].data2 ?? 0) + (history[i].data3 ?? 0));
        result.push({
            x,
            y,
            width,
            height: y_b - y,
            color: colors.quaternaryColor ?? colors.mainColor
        });
    }
    return result;
}

export default function StackedBars(props: StackedBarProps) {
    const timeScale = scaleTime()
        .domain(props.timeDomain)
        .range(props.timeRange);
    const rangeScale = scaleLinear()
        .domain(props.domain)
        .range(props.range);
    const rectangleDims =
        props.history.map((point, i) => calculateRectangles(props.history, i, timeScale, rangeScale, props.colors));
    useDebugValue(rectangleDims);
    return <svg>
        {rectangleDims.map((point, i) =>
            point.map((rect, j) => (
                <rect
                    key={`${i}-${j}`}
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    fill={rect.color.toString()}
                />
            ))
        )}
    </svg>;
}