import {useMemo} from "react";
import {scaleLinear} from "d3";

export default function RightAxis(props: { domain: number[], range: number[], left: number }) {
    const domainString = props.domain.join("-");
    const rangeString = props.range.join("-");
    const ticks = useMemo(() => {
        const scale = scaleLinear()
            .domain(props.domain)
            .range(props.range);
        const approxTickCount = Math.min(10, Math.floor(Math.abs(props.range[0] - props.range[1]) / 30));
        const ticks = scale.ticks(approxTickCount)
            .map(value => Math.round(value * 100) / 100);
        return Array.from(new Set(ticks))
            .sort()
            .map(value => {
            return {
                value,
                yOffset: scale(value)
            };
        });
    }, [domainString, rangeString])
    return <svg x={props.left}>
        <path d={[
            "M", props.range[1], 20,
            "H", 0,
            "V", props.range[0],
            "H", 10
        ].join(" ")}
                fill="none"
                stroke="white"
              />
        {ticks.map(({ value, yOffset}, i) => (
            <g
                key={i}
                transform={`translate(0, ${yOffset})`}
            >
                <line
                    x2="10"
                    stroke="white"
                />
                <text
                    style={{
                        stroke: value < 0 ? "red" : "white",
                        fontSize: "15px",
                        textAnchor: "start",
                        transform: "translateX(15px) translateY(3px)"
                    }}>
                    {value.toFixed(2)}
                </text>
            </g>
        ))}
    </svg>
}