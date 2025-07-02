import {useMemo} from "react";
import {scaleLinear} from "d3";

export default function LeftAxis(props: {domain: number[], range: number[] }) {
    const domainString = props.domain.join("-");
    const rangeString = props.range.join("-");
    const ticks = useMemo(() => {
        const scale = scaleLinear()
            .domain(props.domain)
            .range(props.range);
        return scale.ticks().map(value => {
            return {
                value,
                yOffset: scale(value)
            };
        })
    }, [domainString, rangeString]);
    return <svg>
        <path d={[
            "M", 50, 20,
            "H", 60,
            "V", props.range[0],
            "H", 50,
        ].join(" ")}
              fill="none"
              stroke="black"
        />
        {ticks.map(({ value, yOffset}, i) => (
            <g
                key={i}
                transform={`translate(50, ${yOffset})`}
            >
                <line
                    x2="10"
                    stroke="currentColor"
                />
                <text
                    style={{
                        fontSize: "10px",
                        textAnchor: "end",
                        transform: "translateX(-5px) translateY(3px)"
                    }}>
                    {value.toFixed(2)}
                </text>
            </g>
        ))}
    </svg>;
}