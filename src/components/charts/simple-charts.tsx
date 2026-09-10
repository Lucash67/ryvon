"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Point = Record<string, string | number>;

const GRID = "#1D2E48";
const TICK = "#8EA2BE";
const BLUE = "#0C6CFF";
const CYAN = "#00E2FF";
const GREEN = "#22C995";
const AMBER = "#F4B84C";

const tooltipStyle = {
  background: "#111D31",
  border: "1px solid #1D2E48",
  borderRadius: 12,
  color: "#F8FBFF",
};

export function ChartCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="h-64">{children}</CardContent>
    </Card>
  );
}

export function WeightChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: TICK, fontSize: 12 }} />
        <YAxis tick={{ fill: TICK, fontSize: 12 }} domain={["dataMin - 1", "dataMax + 1"]} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="peso" stroke={BLUE} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CaloriesChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: TICK, fontSize: 12 }} />
        <YAxis tick={{ fill: TICK, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        <Bar dataKey="consumido" fill={BLUE} radius={[6, 6, 0, 0]} />
        <Bar dataKey="planejado" fill={CYAN} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MacrosChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: TICK, fontSize: 12 }} />
        <YAxis tick={{ fill: TICK, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        <Bar dataKey="proteína" fill={GREEN} radius={[6, 6, 0, 0]} />
        <Bar dataKey="carbo" fill={BLUE} radius={[6, 6, 0, 0]} />
        <Bar dataKey="gordura" fill={AMBER} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SleepChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: TICK, fontSize: 12 }} />
        <YAxis tick={{ fill: TICK, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="horas" stroke={BLUE} fill="rgba(12,108,255,0.15)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CardioChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: TICK, fontSize: 12 }} />
        <YAxis tick={{ fill: TICK, fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="minutos" fill={CYAN} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
