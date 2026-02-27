'use client';

import React from 'react';
import { DataPoint, ServerDataPoint } from '@/app/graphs';
import CoreTemperatureControl from '@/controls/CoreTemperatureControl';

export default function PIDPanel(props: {open: boolean, onClose?: ()=>void, history: DataPoint[], latest?: ServerDataPoint | null}) {
    const {open, onClose, history, latest} = props;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div id="pid-panel" className="relative pointer-events-auto w-96 p-4 rounded shadow-lg bg-gray-900/90 text-white">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">Controls</h2>
                    <button className="text-gray-300 hover:text-white" onClick={onClose}>Close</button>
                </div>
                <div className="space-y-3">
                    <CoreTemperatureControl history={history} latest={latest} />
                    <div>
                        <p className="text-sm text-gray-300">When enabled these controls use PID controllers to attempt to manage
                            the target system.  These PIDs have been tuned and tested.  On activation, the PID controllers will attempt to match
                            current control settings in order to avoid shocking the system.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
