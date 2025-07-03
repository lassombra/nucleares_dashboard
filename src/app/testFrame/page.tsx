'use client';
import {color} from "d3";
import {BarGraph, SecondaryAxisSource, SecondaryGraphType} from "@/graphs/barGraph";
import {RGBColor} from "d3-color";

const history = [
    { secondsSinceStart: 0, data: 322.541, data2: 0 },
    { secondsSinceStart: 1, data: 322.531, data2: 0.01 },
    { secondsSinceStart: 2, data: 322.537, data2: 0.02 },
    { secondsSinceStart: 3, data: 322.534, data2: 0.01 },
    { secondsSinceStart: 4, data: 322.531, data2: 0 },
    { secondsSinceStart: 6, data: 321.531, data2: 0 },
    { secondsSinceStart: 8, data: 322.537, data2: 0 },
    { secondsSinceStart: 9, data: 323.531, data2: 0 },
    { secondsSinceStart: 10, data: 323.561, data2: -0.01 },
    { secondsSinceStart: 11, data: 323.531, data2: -0.02 },
    { secondsSinceStart: 12, data: 321.531, data2: -0.03 },
    { secondsSinceStart: 14, data: 322.031, data2: -0.01 },
    { secondsSinceStart: 15, data: 322.331, data2: 0 },
    { secondsSinceStart: 16, data: 322.931, data2: 0.01 },
]
export default function TestFrame() {
    return <div className="grid grid-cols-1 h-svh p-5 bg-black">
        <BarGraph history={history} label="Test Graph" color={{
            mainColor: color('green') as RGBColor,
            secondaryColor: color('red') as RGBColor
        }} secondaryAxisSource={SecondaryAxisSource.data2} secondaryGraphType={SecondaryGraphType.Line} />
    </div>
}