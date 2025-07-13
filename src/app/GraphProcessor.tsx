import {DataPoint, GraphConfig} from "@/app/graphs";
import {Graph} from "@/graphs/graph";

export type GraphProcessorProps = {
    history: DataPoint[];
    graph: GraphConfig;
}

export default function GraphProcessor(props: GraphProcessorProps) {
    const history = props.history.map(props.graph.historyMapper);
    const axes = props.graph.axisMappers.map(mapper => mapper(props.history));
    const labels = props.graph.labelValueMapper(props.history[props.history.length - 1]);
    return <Graph history={history} axes={axes} barAxisIndex={props.graph.barAxisIndex}
                  label = {props.graph.label} labelValues={labels}
                  rightAxis={props.graph.hasRightAxis} color={props.graph.colors} />
}