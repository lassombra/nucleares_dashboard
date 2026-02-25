import {ColorOptions, HistoryDataPoint} from "@/graphs/graph";
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

function getBarsBeforeNow(historyDataPoint: HistoryDataPoint, barIndex: number) {
    return historyDataPoint.bars.reduce((acc, bar, index) => {
        if (index < barIndex) {
            return acc + bar;
        }
        return acc;
    }, 0);
}

function calculateRectangle(history: HistoryDataPoint, barIndex: number,
                            rangeScale: ScaleLinear<number, number, never>) {
    const lowerBarTop = getBarsBeforeNow(history, barIndex);
    // top is the amount of the current bar + the amount of all previous bars
    const top = rangeScale(history.bars[barIndex] + lowerBarTop);
    // bottom is the amount of all previous bars, but no lower than the minimum of the range scale
    const bottom = rangeScale(Math.max(lowerBarTop, rangeScale.domain()[0]));
    const height = bottom - top; // height is the difference between top and bottom
    return {y: top, height};
}
function calculateRectangles(history: HistoryDataPoint[], i: number, timeScale: ScaleTime<number, number, never>, rangeScale: ScaleLinear<number, number, never>, colors: ColorOptions) {
    const x = timeScale(new Date((history[i].minutesSinceStart * 60_000) - (i === 0 ? 0 : 30_000))); // left position of the bar at - 30s except for the first bar
    const width = timeScale(new Date(((history[i + 1]?.minutesSinceStart ??
        history[i].minutesSinceStart) * 60_000) - (i === history.length - 1 ? 0 : 30_000))) - x; // width based on the next point's time
    return history[i].bars.map((bar, barIndex) => {
        const {y, height} = calculateRectangle(history[i], barIndex, rangeScale);
        return {
            x,
            y,
            width,
            height,
            color: colors.barColors[barIndex % colors.barColors.length] // cycle through colors if more bars than colors
        };
    });
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
                    width={Math.max(0,rect.width)}
                    height={Math.max(0,rect.height)}
                    fill={rect.color.toString()}
                />
            ))
        )}
    </svg>;
}