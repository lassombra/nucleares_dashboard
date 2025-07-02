'use client';
import {color} from "d3";
import {BarGraph} from "@/graphs/barGraph";

const history = [
    { secondsSinceStart: 0, data: 322.541 },
    { secondsSinceStart: 1, data: 322.531 },
    { secondsSinceStart: 2, data: 322.537 },
    { secondsSinceStart: 3, data: 322.534 },
    { secondsSinceStart: 4, data: 322.531 },
    { secondsSinceStart: 6, data: 321.531 },
    { secondsSinceStart: 8, data: 322.537 },
    { secondsSinceStart: 9, data: 323.531 },
    { secondsSinceStart: 10, data: 323.561 },
    { secondsSinceStart: 11, data: 323.531 },
    { secondsSinceStart: 12, data: 321.531 },
    { secondsSinceStart: 14, data: 322.031 },
    { secondsSinceStart: 15, data: 322.331 },
    { secondsSinceStart: 16, data: 322.931 },
]
const lineHistory = [
    { secondsSinceStart: 0, data: 0 },
    { secondsSinceStart: 1, data: 0 },
    { secondsSinceStart: 2, data: 0.01 },
    { secondsSinceStart: 3, data: 0 },
    { secondsSinceStart: 4, data: 0 },
    { secondsSinceStart: 6, data: 0.02 },
    { secondsSinceStart: 8, data: 0 },
    { secondsSinceStart: 9, data: -.01 },
    { secondsSinceStart: 10, data: 0 },
    { secondsSinceStart: 11, data: 0 },
    { secondsSinceStart: 12, data: -.02 },
    { secondsSinceStart: 14, data: -.03 },
    { secondsSinceStart: 15, data: -.04 },
    { secondsSinceStart: 16, data: -.01 },
]

export default function TestFrame() {
    return <div className="grid grid-cols-1 h-svh p-5">
        <BarGraph history={history} line1={lineHistory} label="Test Graph" color={color("green")} />
    </div>
}