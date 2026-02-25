'use client';
import React, {useEffect, useRef, useState} from 'react';
import useLocalStorageState from "@/app/useLocalStorageState";
import {DataPoint, graphs, ServerDataPoint} from "@/app/graphs";
import GraphProcessor from "@/app/GraphProcessor";
import Control from "@/app/control";
import {PIDController} from "@/PIDController";



const ENDPOINT = 'http://localhost:8785/?variable=WEBSERVER_BATCH_GET&value=*condenser_*,*coolant_sec*,VACUUM*,*core*,*time*,POWER_*,GENERATOR_*_KW,*CHEM_BORON*,ROD_BANK_POS_0_ORDERED';
const ROOT = 'http://localhost:8785/';



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
    const [history, setHistory] = useLocalStorageState<DataPoint[]>('history', []);
    const [connected, setConnected] = useState<boolean>(false);
    const [setpoint, setSetpoint] = useState<number>(100);
    const [useSetpoint, setUseSetpoint] = useState<boolean>(false);
    const controller = useRef(new PIDController(1.5, 0.2, 0.05))

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
                        if (lastTimestamp !== 0) {
                            let rods = controller.current.update(data.values.CORE_TEMP, setpoint,
                                data.values.TIME_STAMP - lastTimestamp, data.values.ROD_BANK_POS_0_ORDERED);
                            if (data.values.CORE_TEMP > 360) {
                                rods = ((100 - rods) / 2) + rods; // if over 360C, push rods in halfway faster
                            }
                            if (useSetpoint) {
                                setRods(rods, data.values.ROD_BANK_POS_0_ORDERED);
                            } else {
                                controller.current.reset();
                            }
                        }
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
    }, [setHistory, setpoint, useSetpoint]);
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
            <Control setPoint={setpoint} setSetPoint={setSetpoint}
                    useSetpoint={useSetpoint} setUseSetpoint={setUseSetpoint}
            />
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

function setRods(rodPosition: number, currentPosition: number) {
    const targetPosition = rodPosition;
    console.log('Setting rods to ', targetPosition.toFixed(2), ' from ', currentPosition.toFixed(2));
    fetch(`http://localhost:8785/?variable=RODS_ALL_POS_ORDERED&value=${targetPosition.toFixed(1)}`, {
        method: 'POST',
    });
}

export default HistoryGraph;