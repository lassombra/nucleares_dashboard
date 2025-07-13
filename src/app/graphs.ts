import {color, extent} from "d3";
import {HSLColor, RGBColor} from "d3-color";
import {ColorOptions, HistoryDataPoint} from "@/graphs/graph";

export type DataPoint = {
    timestamp: number;
    CONDENSER_VOLUME: number;
    CONDENSER_VAPOR_VOLUME: number;
    CONDENSER_TEMPERATURE: number;
    CONDENSER_VACUUM: number;
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
    CHEM_BORON_PPM: number;
};

export type ServerDataPoint = {
    TIME_STAMP: number;
    CONDENSER_VOLUME: number;
    CONDENSER_VAPOR_VOLUME: number;
    CONDENSER_TEMPERATURE: number;
    CONDENSER_VACUUM: number;
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
    CHEM_BORON_PPM: number;
};

export type LabelledDataPoint = {
    label: string;
    color: RGBColor | HSLColor;
}

export type GraphConfig = {
    hasRightAxis: boolean;
    colors: ColorOptions;
    historyMapper: (dataPoint: DataPoint) => HistoryDataPoint;
    /**
     * Array of functions that map the history data to axis values.
     * Each function will return a min to max range for one axis.
     */
    axisMappers: ((history: DataPoint[]) => [number, number])[];
    barAxisIndex: number;
    label: string;
    labelValueMapper: (current: DataPoint) => LabelledDataPoint[];
}
export const graphs: GraphConfig[] = [
    // CORE data
    {
        hasRightAxis: true,
        colors: {
            barColors: [color('green') as RGBColor],
            lineColors: [color('yellow') as RGBColor]
        },
        historyMapper: (dataPoint: DataPoint) => ({
            minutesSinceStart: dataPoint.timestamp,
            bars: [dataPoint.CORE_TEMP],
            lines: [{data: dataPoint.CORE_STATE_CRITICALITY, axisIndex: 1}],
        }),
        axisMappers: [(history: DataPoint[]) => extent(history, d => d.CORE_TEMP) as [number, number],
            (history: DataPoint[]) => extent(history, d => d.CORE_STATE_CRITICALITY) as [number, number]],
        barAxisIndex: 0,
        label: 'Core',
        labelValueMapper(current: DataPoint){
            return [
                {label: `Temp: ${Math.round(current.CORE_TEMP * 100) / 100}°C`, color: color('green') as RGBColor},
                {label: `Criticality: ${Math.round(current.CORE_STATE_CRITICALITY * 100)/100}`, color: color('yellow') as RGBColor}
            ]
        }
    },
    //IODINE and XENON data
    {
        hasRightAxis: true,
        colors: {lineColors: [
            color('yellow') as RGBColor,
            color('orange') as RGBColor,
            color('green') as RGBColor
        ], barColors: []},
        historyMapper: (dataPoint: DataPoint) => ({
            minutesSinceStart: dataPoint.timestamp,
            bars: [],
            lines: [{
                data: dataPoint.CORE_IODINE_CUMULATIVE,
                axisIndex: 0
            }, {
                data: dataPoint.CORE_XENON_CUMULATIVE,
                axisIndex: 0
            }, {
                data: dataPoint.CHEM_BORON_PPM,
                axisIndex: 1
            }]
        }),
        axisMappers: [(history: DataPoint[]) => {
            const iodine = extent(history, d => d.CORE_IODINE_CUMULATIVE) as [number, number];
            const xenon = extent(history, d => d.CORE_XENON_CUMULATIVE) as [number, number];
            return [Math.min(iodine[0], xenon[0]), Math.max(iodine[1], xenon[1])] as [number, number];
        }, (history: DataPoint[]) =>
            extent(history, d => d.CHEM_BORON_PPM) as [number, number]
        ],
        barAxisIndex: 0,
        label: 'Core',
        labelValueMapper(current: DataPoint) {
            return [
                {label: `Iodine: ${Math.round(current.CORE_IODINE_CUMULATIVE * 100) / 100}`, color: color('yellow') as RGBColor},
                {label: `Xenon: ${Math.round(current.CORE_XENON_CUMULATIVE * 100) / 100}`, color: color('orange') as RGBColor},
                {label: `Boron: ${Math.round(current.CHEM_BORON_PPM)}ppm`, color: color('green') as RGBColor}
            ];
        }
    },
    // condenser
    {
        hasRightAxis: true,
        colors: {
            barColors: [
                color('#29F') as RGBColor, color('white') as RGBColor,
                color('yellow') as RGBColor],
            lineColors: [
                color('green') as RGBColor
            ]
        },
        historyMapper: (dataPoint: DataPoint) => ({
            minutesSinceStart: dataPoint.timestamp,
            bars: [
                dataPoint.CONDENSER_VOLUME / 1000,
                dataPoint.CONDENSER_VAPOR_VOLUME / 1000,
                dataPoint.VACUUM_RETENTION_TANK_VOLUME / 1000
            ],
            lines: [{
                data: dataPoint.CONDENSER_VACUUM * 100, // convert to percentage
                axisIndex: 1
            }]
        }),
        axisMappers: [
            (history: DataPoint[]) => [0, extent(history,
                d => (d.CONDENSER_VOLUME + d.CONDENSER_VAPOR_VOLUME + d.VACUUM_RETENTION_TANK_VOLUME) / 1000)[1]] as [number, number],
            (history: DataPoint[]) => {
                const extents = extent(history, d => d.CONDENSER_VACUUM * 100) as [number, number];
                return [Math.min(80, extents[0]), Math.max(100, extents[1])] as [number, number];
            }
        ],
        barAxisIndex: 0,
        label: 'Condenser',
        labelValueMapper: current => ([
            {label: `Volume: ${Math.round(current.CONDENSER_VOLUME / 1000 * 100) / 100}kL`, color: color('#29F') as RGBColor},
            {label: `Vapor: ${Math.round(current.CONDENSER_VAPOR_VOLUME / 1000 * 100) / 100}kL`, color: color('white') as RGBColor},
            {label: `Vacuum Retention: ${Math.round(current.VACUUM_RETENTION_TANK_VOLUME / 1000 * 100) / 100}kL`, color: color('yellow') as RGBColor},
            {label: `Vacuum: ${Math.round(current.CONDENSER_VACUUM * 100)}%`, color: color('green') as RGBColor}
        ])
    },
    // Steam Generators
    {
        hasRightAxis: false,
        colors: {barColors: [color('#29F') as RGBColor, color('white') as RGBColor], lineColors: []},
        historyMapper: (dataPoint: DataPoint) => ({
            minutesSinceStart: dataPoint.timestamp,
            bars: [
                dataPoint.COOLANT_SEC_0_LIQUID_VOLUME / 1000,
                (dataPoint.COOLANT_SEC_0_VOLUME - dataPoint.COOLANT_SEC_0_LIQUID_VOLUME) / 1000
            ],
            lines: []
        }),
        axisMappers: [(history: DataPoint[]) => [0,
            extent(history, d => d.COOLANT_SEC_0_VOLUME / 1000)[1]] as [number, number]],
        barAxisIndex: 0,
        label: 'STG 1',
        labelValueMapper: (current: DataPoint) => ([
            {label: `Liquid: ${Math.round(current.COOLANT_SEC_0_LIQUID_VOLUME / 1000 * 100) / 100}kL`, color: color('#29F') as RGBColor},
            {label: `Steam: ${Math.round((current.COOLANT_SEC_0_VOLUME - current.COOLANT_SEC_0_LIQUID_VOLUME) / 1000 * 100) / 100}kL`, color: color('white') as RGBColor}
        ])
    },
    {
        hasRightAxis: false,
        colors: {barColors: [color('#29F') as RGBColor, color('white') as RGBColor], lineColors: []},
        historyMapper: (dataPoint: DataPoint) => ({
            minutesSinceStart: dataPoint.timestamp,
            bars: [
                dataPoint.COOLANT_SEC_1_LIQUID_VOLUME / 1000,
                (dataPoint.COOLANT_SEC_1_VOLUME - dataPoint.COOLANT_SEC_1_LIQUID_VOLUME) / 1000
            ],
            lines: []
        }),
        axisMappers: [(history: DataPoint[]) => [0,
            extent(history, d => d.COOLANT_SEC_1_VOLUME / 1000)[1]] as [number, number]],
        barAxisIndex: 0,
        label: 'STG 2',
        labelValueMapper: (current: DataPoint) => ([
            {label: `Liquid: ${Math.round(current.COOLANT_SEC_1_LIQUID_VOLUME / 1000 * 100) / 100}kL`, color: color('#29F') as RGBColor},
            {label: `Steam: ${Math.round((current.COOLANT_SEC_1_VOLUME - current.COOLANT_SEC_1_LIQUID_VOLUME) / 1000 * 100) / 100}kL`, color: color('white') as RGBColor}
        ])
    },
    {
        hasRightAxis: false,
        colors: {barColors: [color('#29F') as RGBColor, color('white') as RGBColor], lineColors: []},
        historyMapper: (dataPoint: DataPoint) => ({
            minutesSinceStart: dataPoint.timestamp,
            bars: [
                dataPoint.COOLANT_SEC_2_LIQUID_VOLUME / 1000,
                (dataPoint.COOLANT_SEC_2_VOLUME - dataPoint.COOLANT_SEC_2_LIQUID_VOLUME) / 1000
            ],
            lines: []
        }),
        axisMappers: [(history: DataPoint[]) => [0,
            extent(history, d => d.COOLANT_SEC_2_VOLUME / 1000)[1]] as [number, number]],
        barAxisIndex: 0,
        label: 'STG 3',
        labelValueMapper: (current: DataPoint) => ([
            {label: `Liquid: ${Math.round(current.COOLANT_SEC_2_LIQUID_VOLUME / 1000 * 100) / 100}kL`, color: color('#29F') as RGBColor},
            {label: `Steam: ${Math.round((current.COOLANT_SEC_2_VOLUME - current.COOLANT_SEC_2_LIQUID_VOLUME) / 1000 * 100) / 100}kL`, color: color('white') as RGBColor}
        ])
    }
]