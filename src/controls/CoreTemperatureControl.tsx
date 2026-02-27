'use client';

import React, {useEffect, useRef, useState} from 'react';
import PIDAgent from './PIDAgent';
import { PIDController } from '@/PIDController';
import { DataPoint, ServerDataPoint } from '@/app/graphs';

export default function CoreTemperatureControl(props: { history: DataPoint[], latest?: ServerDataPoint | null }) {
    const { history, latest } = props;
    const controllerRef = useRef<PIDController>(new PIDController(0.5, 0.2, 0.05, [0, 100], true));
    const [setpoint, setSetpoint] = useState<number>(100);
    const [useSetpoint, setUseSetpoint] = useState<boolean>(false);
    const lastProcessedTimestampRef = useRef<number | null>(null);

    // apply function used by PIDAgent
    const applyCommand = async (command: number, current: number) => {
        const targetPosition = command;
        console.log('CoreTemperatureControl: Applying command -> Setting rods to ', targetPosition.toFixed(2), ' from ', current.toFixed(2));
        await fetch(`http://localhost:8785/?variable=RODS_ALL_POS_ORDERED&value=${targetPosition.toFixed(1)}`, {
            method: 'POST',
        });
    };

    const agentRef = useRef<PIDAgent>(new PIDAgent(controllerRef.current, applyCommand, { enabled: false }));

    // compute rods whenever history or latest changes
    useEffect(() => {
        if (!latest || history.length < 2) return;
        const latestTs = latest.TIME_STAMP;
        if (lastProcessedTimestampRef.current === latestTs) return;
        lastProcessedTimestampRef.current = latestTs;

        const prev = history[history.length - 2];
        const curr = history[history.length - 1];
        const dt = curr.timestamp - prev.timestamp;
        const currentTemp = latest.CORE_TEMP;
        const currentPosition = (latest as unknown as { ROD_BANK_POS_0_ORDERED?: number }).ROD_BANK_POS_0_ORDERED ?? 0;

        (async () => {
            if (!agentRef.current) return;
            if (!controllerRef.current) {
                controllerRef.current = new PIDController(0.5, 0.2, 0.05, [0, 100], true);
                agentRef.current.setController(controllerRef.current);
            }
            agentRef.current.setEnabled(useSetpoint);
            if (!useSetpoint) {
                agentRef.current.reset();
                return;
            }
            try {
                await agentRef.current.cycle(setpoint, currentTemp, dt, currentPosition);
            } catch (e) {
                console.error('CoreTemperatureControl PIDAgent cycle error', e);
            }
        })();

    }, [history, latest, setpoint, useSetpoint]);

    const handleToggleUse = () => {
        setUseSetpoint(u => {
            const next = !u;
            if (!next && agentRef.current) {
                agentRef.current.reset();
            }
            if (agentRef.current) agentRef.current.setEnabled(next);
            return next;
        });
    }

    return (
        <div className="text-white p-1">
            <label className="flex items-center gap-2">
                <span className="mr-2">Manage Control Rods</span>
                <input type="checkbox" checked={useSetpoint} onChange={handleToggleUse} />
            </label>
            <label className="flex flex-col mt-2">
                <span className="text-sm">Setpoint (0-400)</span>
                <input type="number" min={0} max={400} value={setpoint}
                       onChange={e => setSetpoint(Number(e.currentTarget.value))}
                       className="border border-gray-600 rounded px-2 py-1 bg-gray-800 text-white" />
            </label>
        </div>
    );
}

