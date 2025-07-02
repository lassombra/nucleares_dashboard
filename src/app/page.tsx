'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

type DataPoint = {
  timestamp: number;
  CONDENSER_VOLUME: number;
  CONDENSER_VAPOR_VOLUME: number;
  COOLANT_SEC_2_VOLUME: number;
  VACUUM_RETENTION_TANK_VOLUME: number;
  CORE_TEMP: number;
  CORE_XENON_CUMULATIVE: number;
  CORE_IODINE_CUMULATIVE: number;
};

const ENDPOINT = 'http://localhost:8785/?variable=WEBSERVER_BATCH_GET&value=*condenser_vapor_volume*,*condenser_volume*,*coolant_sec_2_volume*,VACUUM_RETENTION_TANK_VOLUME,*core*';

const chartConfigs = [
  { key: 'CONDENSER_VOLUME', label: 'Condenser Volume' },
  { key: 'CONDENSER_VAPOR_VOLUME', label: 'Condenser Vapor Volume' },
  { key: 'COOLANT_SEC_2_VOLUME', label: 'Coolant Sec 2 Volume' },
  { key: 'CONDENSOR_TOTAL', label: 'Condenser Total' },
  { key: 'CORE_TEMP', label: 'Core Temperature' },
  {key: 'CORE_IODINE_CUMULATIVE', label: 'Iodine'},
  {key: 'CORE_XENON_CUMULATIVE', label: 'Xenon' },
  { key: 'VACUUM_RETENTION_TANK_VOLUME', label: 'Vacuum Retention Tank Volume' },
  {key: 'SECONDARY_TOTAL', label: 'Secondary Total' }
];

type ChartProps = {
  history: DataPoint[];
  chartKey: string;
  label: string;
};

const Chart: React.FC<ChartProps> = ({ history, chartKey, label }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  let values : number[] = [];
  switch (chartKey) {
    case 'CONDENSOR_TOTAL':
        values = history.map(d => d.CONDENSER_VOLUME + d.CONDENSER_VAPOR_VOLUME);
        break;
    case 'SECONDARY_TOTAL':
        values = history.map(d => d.COOLANT_SEC_2_VOLUME + d.CONDENSER_VOLUME + d.CONDENSER_VAPOR_VOLUME + d.VACUUM_RETENTION_TANK_VOLUME);
        break;
    default:
      values = history.map(d => d[chartKey as keyof DataPoint] as number);
  }
  useEffect(() => {
    if (!svgRef.current || history.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 500;
    const height = 230;
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };

    // Compute values for the selected key or total
    let values : number[] = [];
    switch (chartKey) {
      case 'CONDENSOR_TOTAL':
        values = history.map(d => d.CONDENSER_VOLUME + d.CONDENSER_VAPOR_VOLUME);
        break;
      case 'SECONDARY_TOTAL':
        values = history.map(d => d.COOLANT_SEC_2_VOLUME + d.CONDENSER_VOLUME + d.CONDENSER_VAPOR_VOLUME + d.VACUUM_RETENTION_TANK_VOLUME);
        break;
      default:
        values = history.map(d => d[chartKey as keyof DataPoint] as number);
    }
    values = values.filter(v => v !== undefined && v !== null);
    const min = d3.min(values) ?? 0;
    const max = d3.max(values) ?? 1;

    const x = d3
      .scaleTime()
      .domain(d3.extent(history, (d) => new Date(d.timestamp)) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([min, max])
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line<number>()
      .x((_, i) => x(new Date(history[i].timestamp)))
      .y((v) => y(v));

    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y)
          .ticks(6, ",f"));

    svg
      .append('path')
      .datum(values)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 4)
      .attr('d', line);
  }, [history, chartKey]);

  return (
    <div style={{ marginBottom: 32 }}>
      <div>{label} {values[values.length - 1]}</div>
      <svg ref={svgRef} width={500} height={230} />
    </div>
  );
};

const HistoryGraph: React.FC = () => {
  const [history, setHistory] = useState<DataPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(ENDPOINT);
      const data = await res.json();
      setHistory((prev) => [
        ...prev,
        {
          timestamp: Date.now(),
          CONDENSER_VOLUME: data.values.CONDENSER_VOLUME,
          CONDENSER_VAPOR_VOLUME: data.values.CONDENSER_VAPOR_VOLUME,
          COOLANT_SEC_2_VOLUME: data.values.COOLANT_SEC_2_VOLUME,
            VACUUM_RETENTION_TANK_VOLUME: data.values.VACUUM_RETENTION_TANK_VOLUME,
            CORE_TEMP: data.values.CORE_TEMP,
          CORE_XENON_CUMULATIVE: data.values.CORE_XENON_CUMULATIVE,
          CORE_IODINE_CUMULATIVE: data.values.CORE_IODINE_CUMULATIVE
        },
      ].slice(-600));
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 m-10">
      {chartConfigs.map((cfg) => (
        <Chart
          key={cfg.key}
          history={history}
          chartKey={cfg.key}
          label={cfg.label}
        />
      ))}
    </div>
  );
};

export default HistoryGraph;
