'use client';

import React, {useRef, useState, useEffect} from 'react';
import {PIDController} from '@/PIDController';
import { DataPoint, ServerDataPoint } from '@/app/graphs';

export default function PIDPanel(props: {open: boolean, onClose?: ()=>void, history: DataPoint[], latest?: ServerDataPoint | null}) {
    const {open, onClose, history, latest} = props;
    const controllerRef = useRef(new PIDController(0.5, 0.2, 0.05, [0, 100], true));
    const [setpoint, setSetpoint] = useState<number>(100);
    const [useSetpoint, setUseSetpoint] = useState<boolean>(false);
    const lastProcessedTimestampRef = useRef<number | null>(null);
    const applyingRef = useRef(false);

    async function setRods(rodPosition: number, currentPosition: number) {
        const targetPosition = rodPosition;
        console.log('PIDPanel: Setting rods to ', targetPosition.toFixed(2), ' from ', currentPosition.toFixed(2));
        try {
            await fetch(`http://localhost:8785/?variable=RODS_ALL_POS_ORDERED&value=${targetPosition.toFixed(1)}`, {
                method: 'POST',
            });
        } catch (e) {
            console.error('Failed to set rods', e);
        }
    }

    // compute rods whenever history or latest changes
    useEffect(() => {
        // require a latest server reading and at least two history points to compute dt
        if (!latest || history.length < 2) return;
        const latestTs = latest.TIME_STAMP;
        // avoid reprocessing same timestamp
        if (lastProcessedTimestampRef.current === latestTs) return;
        lastProcessedTimestampRef.current = latestTs;

        const prev = history[history.length - 2];
        const curr = history[history.length - 1];
        const dt = curr.timestamp - prev.timestamp;
        const currentTemp = latest.CORE_TEMP;
        const currentPosition = (latest as unknown as { ROD_BANK_POS_0_ORDERED?: number }).ROD_BANK_POS_0_ORDERED ?? 0;

        (async () => {
            if (!useSetpoint) {
                controllerRef.current.reset();
                return;
            }
            if (applyingRef.current) return; // avoid overlapping calls
            applyingRef.current = true;
            try {
                const raw = controllerRef.current.update(currentTemp, setpoint, dt, currentPosition);
                let rods = raw;
                if (currentTemp > 360) {
                    rods = ((100 - raw) / 2) + raw;
                }
                await setRods(rods, currentPosition);
            } catch (e) {
                console.error('PIDPanel compute error', e);
            } finally {
                applyingRef.current = false;
            }
        })();

    }, [history, latest, setpoint, useSetpoint]);

    const handleToggleUse = () => {
        setUseSetpoint(u => {
            if (u) {
                controllerRef.current.reset();
            }
            return !u;
        });
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative pointer-events-auto w-96 p-4 rounded shadow-lg bg-gray-900/90 text-white">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">PID Controller</h2>
                    <button className="text-gray-300 hover:text-white" onClick={onClose}>Close</button>
                </div>
                <div className="space-y-3">
                    <label className="flex items-center gap-2">
                        <span>Use PID?</span>
                        <input type="checkbox" checked={useSetpoint} onChange={handleToggleUse} />
                    </label>
                    <label className="flex flex-col">
                        <span>Setpoint (0-400)</span>
                        <input type="number" min={0} max={400} value={setpoint}
                               onChange={e => setSetpoint(Number(e.currentTarget.value))}
                               className="border border-gray-600 rounded px-2 py-1 bg-gray-800 text-white" />
                    </label>
                    <div>
                        <p className="text-sm text-gray-300">When enabled the PID controller will compute a value 0-100 to move rods (lower output raises target).</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
