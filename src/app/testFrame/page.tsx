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

const history2 = [
    { secondsSinceStart: 0, data: 145.21215, data2: 25.1331},
    { secondsSinceStart: 2, data: 144.21215, data2: 25.1331},
    { secondsSinceStart: 3, data: 145.21215, data2: 26.1331},
    { secondsSinceStart: 4, data: 145.21215, data2: 26.1331},
    { secondsSinceStart: 5, data: 147.21215, data2: 24.1331},
    { secondsSinceStart: 6, data: 148.21215, data2: 24.1331},
    { secondsSinceStart: 7, data: 147.21215, data2: 24.1331},
    { secondsSinceStart: 8, data: 146.21215, data2: 25.1331},
    { secondsSinceStart: 9, data: 145.21215, data2: 26.1331},
    { secondsSinceStart: 10, data: 144.21215, data2: 27.1331},
    { secondsSinceStart: 11, data: 143.21215, data2: 28.1331},
    { secondsSinceStart: 12, data: 142.21215, data2: 29.1331},
    { secondsSinceStart: 13, data: 141.21215, data2: 30.1331},
    { secondsSinceStart: 14, data: 140.21215, data2: 31.1331},
    { secondsSinceStart: 15, data: 139.21215, data2: 32.1331},
    { secondsSinceStart: 16, data: 138.21215, data2: 33.1331},
    { secondsSinceStart: 17, data: 137.21215, data2: 34.1331},
    { secondsSinceStart: 18, data: 136.21215, data2: 35.1331},
]
export default function TestFrame() {
    return <div className="grid grid-cols-1 h-svh p-5 bg-black">
        <BarGraph history={history2} label="Test Graph" color={{
            mainColor: color('green') as RGBColor,
            secondaryColor: color('red') as RGBColor
        }} secondaryAxisSource={SecondaryAxisSource.None} secondaryGraphType={SecondaryGraphType.StackedBar} />
    </div>
}