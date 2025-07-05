'use client';
import React, {useEffect, useState} from 'react';
import {BarGraph, ColorOptions, HistoryDataPoint, SecondaryAxisSource, SecondaryGraphType} from "@/graphs/barGraph";
import {color} from "d3";
import {RGBColor} from "d3-color";
import useLocalStorageState from "@/app/useLocalStorageState";

type DataPoint = {
    timestamp: number;
    CONDENSER_VOLUME: number;
    CONDENSER_VAPOR_VOLUME: number;
    COOLANT_SEC_0_LIQUID_VOLUME: number;
    COOLANT_SEC_0_VOLUME: number;
    COOLANT_SEC_1_LIQUID_VOLUME: number;
    COOLANT_SEC_1_VOLUME: number;
    COOLANT_SEC_2_LIQUID_VOLUME: number;
    COOLANT_SEC_2_VOLUME: number;
    VACUUM_RETENTION_TANK_VOLUME: number;
    CORE_TEMP: number;
    CORE_STATE_CRITICALITY: number;
    CORE_XENON_CUMULATIVE: number;
    CORE_IODINE_CUMULATIVE: number;
    GENERATOR_0_KW: number;
    GENERATOR_1_KW: number;
    GENERATOR_2_KW: number;
    POWER_DEMAND_MW: number;
};

const ENDPOINT = 'http://localhost:8785/?variable=WEBSERVER_BATCH_GET&value=*condenser_*,*coolant_sec*,VACUUM*,*core*,*time*,POWER_*,GENERATOR_*_KW';

type GraphConfig = {
    secondaryAxis: SecondaryAxisSource,
    secondaryType: SecondaryGraphType,
    colors: ColorOptions;
    historyMapper: (dataPoint: DataPoint) => HistoryDataPoint;
    label: string;
}

const graphs:GraphConfig[] = [
    // CORE data
    {
        secondaryAxis: SecondaryAxisSource.data2,
        secondaryType: SecondaryGraphType.Line,
        colors: {
            mainColor: color('green') as RGBColor,
            secondaryColor: color('yellow') as RGBColor
        },
        historyMapper: (dataPoint:DataPoint) => ({
            secondsSinceStart: dataPoint.timestamp,
            data: dataPoint.CORE_TEMP,
            data2: dataPoint.CORE_STATE_CRITICALITY,
        }),
        label: 'Core Temperature and Criticality',
    },
    //IODINE and XENON data
    {
        secondaryType: SecondaryGraphType.None,
        secondaryAxis: SecondaryAxisSource.None,
        colors: {mainColor: color('yellow') as RGBColor},
        historyMapper: (dataPoint: DataPoint) => ({
            secondsSinceStart: dataPoint.timestamp,
            data: dataPoint.CORE_IODINE_CUMULATIVE,
        }),
        label: 'Core Iodine concentration'
    },
    {
        secondaryType: SecondaryGraphType.None,
        secondaryAxis: SecondaryAxisSource.None,
        colors: {mainColor: color('yellow') as RGBColor},
        historyMapper: (dataPoint: DataPoint) => ({
            secondsSinceStart: dataPoint.timestamp,
            data: dataPoint.CORE_XENON_CUMULATIVE,
        }),
        label: 'Core Xenon concentration'
    },
    // Steam Generators
    {
        secondaryType: SecondaryGraphType.StackedBar,
        secondaryAxis: SecondaryAxisSource.None,
        colors: {mainColor: color('blue') as RGBColor, secondaryColor: color('white') as RGBColor},
        historyMapper: (dataPoint: DataPoint) => ({
            secondsSinceStart: dataPoint.timestamp,
            data: dataPoint.COOLANT_SEC_0_LIQUID_VOLUME / 1000,
            data2: (dataPoint.COOLANT_SEC_0_VOLUME - dataPoint.COOLANT_SEC_0_LIQUID_VOLUME)/1000
        }),
        label: 'Steam Generator 1 contents'
    },
    {
        secondaryType: SecondaryGraphType.StackedBar,
        secondaryAxis: SecondaryAxisSource.None,
        colors: {mainColor: color('blue') as RGBColor, secondaryColor: color('white') as RGBColor},
        historyMapper: (dataPoint: DataPoint) => ({
            secondsSinceStart: dataPoint.timestamp,
            data: dataPoint.COOLANT_SEC_1_LIQUID_VOLUME / 1000,
            data2: (dataPoint.COOLANT_SEC_1_VOLUME - dataPoint.COOLANT_SEC_1_LIQUID_VOLUME) / 1000
        }),
        label: 'Steam Generator 2 contents'
    },
    {
        secondaryType: SecondaryGraphType.StackedBar,
        secondaryAxis: SecondaryAxisSource.None,
        colors: {mainColor: color('blue') as RGBColor, secondaryColor: color('white') as RGBColor},
        historyMapper: (dataPoint: DataPoint) => ({
            secondsSinceStart: dataPoint.timestamp,
            data: dataPoint.COOLANT_SEC_2_LIQUID_VOLUME / 1000,
            data2: (dataPoint.COOLANT_SEC_2_VOLUME - dataPoint.COOLANT_SEC_2_LIQUID_VOLUME) / 1000
        }),
        label: 'Steam Generator 3 contents'
    },
    // condenser
    {
        secondaryType: SecondaryGraphType.StackedBar,
        secondaryAxis: SecondaryAxisSource.None,
        colors: {mainColor: color('blue') as RGBColor, secondaryColor: color('white') as RGBColor, tertiaryColor: color('yellow') as RGBColor},
        historyMapper: (dataPoint: DataPoint) => ({
            secondsSinceStart: dataPoint.timestamp,
            data: dataPoint.CONDENSER_VOLUME / 1000,
            data2: dataPoint.CONDENSER_VAPOR_VOLUME / 1000,
            data3: dataPoint.VACUUM_RETENTION_TANK_VOLUME / 1000
        }),
        label: 'Condenser contents (+ retention tank)'
    }
]

function combineHistory(param: DataPoint) {
    return (history:DataPoint[]) => {
        if (history[history.length - 1].timestamp === param.timestamp) {
            return history;
        }
        return [...history, param].slice(-600);
    }
}

const HistoryGraph: React.FC = () => {
    const [history, setHistory] = useLocalStorageState<DataPoint[]>('history',[]);
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

    if (!connected) {
        return <div className="text-white text-center p-10 bg-black text-3xl h-dvh">Waiting for data...  Please start the webserver in Nucleares</div>;
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-black h-dvh">
            {history && history.length && graphs.map((graph, index) => (
                <BarGraph history={history.map(graph.historyMapper)} secondaryGraphType={graph.secondaryType}
                          secondaryAxisSource={graph.secondaryAxis} color={graph.colors} label={graph.label}
                          key={index}
                />
            ))}
        </div>
    );
};

export default HistoryGraph;
