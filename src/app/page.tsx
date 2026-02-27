'use client';
import React, {useEffect, useState} from 'react';
import useLocalStorageState from "@/app/useLocalStorageState";
import {DataPoint, graphs, ServerDataPoint} from "@/app/graphs";
import GraphProcessor from "@/app/GraphProcessor";
import PIDPanel from '@/controls/PIDPanel';



const ENDPOINT = 'http://localhost:8785/?variable=WEBSERVER_BATCH_GET&value=*condenser_*,*coolant_sec*,VACUUM*,*core*,*time*,POWER_*,GENERATOR_*_KW,*CHEM_BORON*,ROD_BANK_POS_0_ORDERED';


function combineHistory(param: DataPoint) {
    return (history:DataPoint[]) => {
        if (history.length !== 0 && history[history.length - 1].timestamp === param.timestamp) {
            return history;
        }
        return [...history, param].slice(-600);
    }
}

function makeHistory(values: ServerDataPoint): DataPoint {
    return {
        timestamp: values.TIME_STAMP,
        CONDENSER_VOLUME: values.CONDENSER_VOLUME,
        CONDENSER_VAPOR_VOLUME: values.CONDENSER_VAPOR_VOLUME,
        CONDENSER_VACUUM: values.CONDENSER_VACUUM,
        CONDENSER_TEMPERATURE: values.CONDENSER_TEMPERATURE,
        COOLANT_SEC_0_LIQUID_VOLUME: values.COOLANT_SEC_0_LIQUID_VOLUME,
        COOLANT_SEC_0_VOLUME: values.COOLANT_SEC_0_VOLUME,
        COOLANT_SEC_0_PRESSURE: values.COOLANT_SEC_0_PRESSURE,
        COOLANT_SEC_1_LIQUID_VOLUME: values.COOLANT_SEC_1_LIQUID_VOLUME,
        COOLANT_SEC_1_VOLUME: values.COOLANT_SEC_1_VOLUME,
        COOLANT_SEC_1_PRESSURE: values.COOLANT_SEC_1_PRESSURE,
        COOLANT_SEC_2_LIQUID_VOLUME: values.COOLANT_SEC_2_LIQUID_VOLUME,
        COOLANT_SEC_2_VOLUME: values.COOLANT_SEC_2_VOLUME,
        COOLANT_SEC_2_PRESSURE: values.COOLANT_SEC_2_PRESSURE,
        VACUUM_RETENTION_TANK_VOLUME: values.VACUUM_RETENTION_TANK_VOLUME,
        CORE_TEMP: values.CORE_TEMP,
        CORE_STATE_CRITICALITY: values.CORE_STATE_CRITICALITY,
        CORE_XENON_CUMULATIVE: values.CORE_XENON_CUMULATIVE,
        CORE_IODINE_CUMULATIVE: values.CORE_IODINE_CUMULATIVE,
        GENERATOR_0_KW: values.GENERATOR_0_KW,
        GENERATOR_1_KW: values.GENERATOR_1_KW,
        GENERATOR_2_KW: values.GENERATOR_2_KW,
        POWER_DEMAND_MW: values.POWER_DEMAND_MW,
        CHEM_BORON_PPM: values.CHEM_BORON_PPM
    }
}

const HistoryGraph: React.FC = () => {
    const [history, setHistory] = useLocalStorageState<DataPoint[]>('history', [], 1);
    const [connected, setConnected] = useState<boolean>(false);
    const [panelOpen, setPanelOpen] = useState<boolean>(false);
    const [latest, setLatest] = useState<ServerDataPoint | null>(null);

    useEffect(() => {
        let lastTimestamp = 0;
        const fetchData = async () => {
            try {
                const res = await fetch(ENDPOINT);
                if (!res.ok) {
                    setConnected(false);
                } else {
                    const data = await res.json();
                    setConnected(true);
                    if (data.values.TIME_STAMP != lastTimestamp) {
                        setHistory(combineHistory(makeHistory(data.values)));
                        setLatest(data.values);
                        lastTimestamp = data.values.TIME_STAMP
                    }
                }
            } catch {
                setConnected(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, [setHistory]);
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F11") {
                // @ts-expect-error - electron is injected in the desktop build
                if (window?.electron) {
                    e.preventDefault();
                }
                // @ts-expect-error - electron is injected in the desktop build
                window?.electron?.ipcRenderer?.send?.("toggle-fullscreen");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="bg-black h-dvh overflow-hidden flex flex-col">
            <h1 className="text-center text-white text-4xl font-bold mb-4">Nucleares History Graphs</h1>
            <p className="text-center text-gray-400 mb-8">Graphs are updated every second with the latest data from the
                Nucleares webserver.
                Graphs take into account pause and simulation rate. Time on the graphs is updated roughly one in-game minute.
                <a href="#" onClick={() => setHistory([])} className="font-bold text-lime-100">click here to clear data.</a>
            </p>
            {/* Sidebar toggle button */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40">
                <button onClick={() => setPanelOpen(true)}
                        className="bg-gray-800 text-white px-3 py-2 rounded-l hover:bg-gray-700">Controls</button>
            </div>

            <PIDPanel open={panelOpen} onClose={() => setPanelOpen(false)} history={history} latest={latest ?? undefined} />
            {
                !connected ?
                <p className="text-center text-5xl text-red-500 mb-4">Failed to connect to the Nucleares webserver.
                    Please ensure that you have started the webserver from the status app in game.</p> :
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-5 overflow-hidden h-full">
                    {history && history.length && graphs.map((graph, index) => (
                        <GraphProcessor history={history} graph={graph} key={index} />
                    ))}
                </div>
            }
        </div>
    );
};


export default HistoryGraph;