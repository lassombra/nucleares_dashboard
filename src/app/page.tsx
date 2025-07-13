'use client';
import React, {useEffect, useState} from 'react';
import {Graph} from "@/graphs/graph";
import useLocalStorageState from "@/app/useLocalStorageState";
import {DataPoint, graphs} from "@/app/graphs";
import GraphProcessor from "@/app/GraphProcessor";



const ENDPOINT = 'http://localhost:8785/?variable=WEBSERVER_BATCH_GET&value=*condenser_*,*coolant_sec*,VACUUM*,*core*,*time*,POWER_*,GENERATOR_*_KW';



function combineHistory(param: DataPoint) {
    return (history:DataPoint[]) => {
        if (history.length !== 0 && history[history.length - 1].timestamp === param.timestamp) {
            return history;
        }
        return [...history, param].slice(-600);
    }
}

const HistoryGraph: React.FC = () => {
    const [history, setHistory] = useLocalStorageState<DataPoint[]>('history', []);
    const [connected, setConnected] = useState<boolean>(false);

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
                        setHistory(combineHistory({
                            timestamp: data.values.TIME_STAMP,
                            CONDENSER_VOLUME: data.values.CONDENSER_VOLUME,
                            CONDENSER_VAPOR_VOLUME: data.values.CONDENSER_VAPOR_VOLUME,
                            CONDENSER_VACUUM: data.values.CONDENSER_VACUUM,
                            CONDENSER_TEMPERATURE: data.values.CONDENSER_TEMPERATURE,
                            COOLANT_SEC_0_LIQUID_VOLUME: data.values.COOLANT_SEC_0_LIQUID_VOLUME,
                            COOLANT_SEC_0_VOLUME: data.values.COOLANT_SEC_0_VOLUME,
                            COOLANT_SEC_1_LIQUID_VOLUME: data.values.COOLANT_SEC_1_LIQUID_VOLUME,
                            COOLANT_SEC_1_VOLUME: data.values.COOLANT_SEC_1_VOLUME,
                            COOLANT_SEC_2_LIQUID_VOLUME: data.values.COOLANT_SEC_2_LIQUID_VOLUME,
                            COOLANT_SEC_2_VOLUME: data.values.COOLANT_SEC_2_VOLUME,
                            VACUUM_RETENTION_TANK_VOLUME: data.values.VACUUM_RETENTION_TANK_VOLUME,
                            CORE_TEMP: data.values.CORE_TEMP,
                            CORE_STATE_CRITICALITY: data.values.CORE_STATE_CRITICALITY,
                            CORE_XENON_CUMULATIVE: data.values.CORE_XENON_CUMULATIVE,
                            CORE_IODINE_CUMULATIVE: data.values.CORE_IODINE_CUMULATIVE,
                            GENERATOR_0_KW: data.values.GENERATOR_0_KW,
                            GENERATOR_1_KW: data.values.GENERATOR_1_KW,
                            GENERATOR_2_KW: data.values.GENERATOR_2_KW,
                            POWER_DEMAND_MW: data.values.POWER_DEMAND_MW,
                        }));
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
                // @ts-ignore
                if (window?.electron) {
                    e.preventDefault();
                }
                // @ts-ignore
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
