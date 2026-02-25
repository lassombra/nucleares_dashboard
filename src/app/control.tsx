'use client';
import {ReactNode} from "react";

export default function Control(props: {setPoint: number, setSetPoint: (val: number)=>void,
    useSetpoint: boolean, setUseSetpoint: (val: boolean)=>void}) : ReactNode {

    return <div className="text-white p-5">PID Setpoint: <input
        type="number"
        className="border-2 border-gray-500"
        value={props.setPoint} onChange={event => props.setSetPoint(Number(event.currentTarget.value))} />
        <label className="p-2">use PID?</label>
        <input type="checkbox" checked={props.useSetpoint} onChange={() => props.setUseSetpoint(!props.useSetpoint)} />
    </div>
}