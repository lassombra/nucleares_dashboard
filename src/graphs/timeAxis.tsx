import {useMemo} from "react";
import {scaleTime} from "d3";

function formatMinutesSeconds(date:Date) {
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${m}:${s}`;
}
export default function TimeAxis(props: { width: number, height: number, domain: Date[], range: number[], y:number }) {
    const domainString = props.domain.map(formatMinutesSeconds).join("-");
    const rangeString = props.range.join("-");
    const ticks = useMemo(() => {
        const xScale = scaleTime()
            .domain(props.domain)
            .range(props.range)
        return xScale.ticks()
            .map(value => ({
                value,
                xOffset: xScale(value)
            }))
    }, [
        domainString, rangeString
    ])
    return <svg y={props.y}>
        <path d={[
            "M", props.range[0], 6,
            "v", -6,
            "H", props.range[1],
            "v", 6,
        ].join(" ")}
              fill="none"
              stroke="white"
        />
        {ticks.map(({ value, xOffset }, i) => (
            <g
                key={i}
                transform={`translate(${xOffset}, 0)`}
            >
                <line
                    y2="6"
                    stroke="white"
                />
                <text
                    style={{
                        stroke: 'white',
                        fontSize: "15px",
                        textAnchor: "middle",
                        transform: "translateY(20px)"
                    }}>
                    { formatMinutesSeconds(value) }
                </text>
            </g>
        ))}
    </svg>
}