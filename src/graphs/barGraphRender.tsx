import {ColorOptions, HistoryDataPoint, SecondaryGraphType} from "@/graphs/barGraph";
import SingleBars from "@/graphs/singleBars";
import Lines from "@/graphs/Lines";
import StackedBars from "@/graphs/stackedBars";

export type BarGraphRenderProps = {
    history: HistoryDataPoint[];
    secondaryGraphType: SecondaryGraphType;
    colors: ColorOptions;
    axes: AxisData;
}

export type AxisData = {
    primary: {
        domain: number[];
        range: number[];
    };
    secondary?: {
        domain: number[];
        range: number[];
    };
    tertiary?: {
        domain: number[];
        range: number[];
    };
    quaternary?: {
        domain: number[];
        range: number[];
    };
    time: {
        domain: Date[];
        range: number[];
    }
}

export default function BarGraphRender(props: BarGraphRenderProps) {
    if (props.secondaryGraphType !== SecondaryGraphType.StackedBar) {
        return <svg>
            <SingleBars history={props.history} color={props.colors.mainColor}
                           timeRange={props.axes.time.range} timeDomain={props.axes.time.domain}
                           range={props.axes.primary.range} domain={props.axes.primary.domain}/>
            {props.secondaryGraphType === SecondaryGraphType.Line ? <Lines history={props.history} colors={props.colors} axes={props.axes} /> : null}
        </svg>
    } else {
        return <svg>
            <StackedBars history={props.history} colors={props.colors}
                            timeRange={props.axes.time.range} timeDomain={props.axes.time.domain}
                            range={props.axes.primary.range} domain={props.axes.primary.domain}/>
        </svg>
    }
}