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
        <CartesianGrid stroke="#E6EAF0" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#667085", fontSize: 12 }} />
        <YAxis tick={{ fill: "#667085", fontSize: 12 }} domain={["dataMin - 1", "dataMax + 1"]} />
        <Tooltip />
        <Line type="monotone" dataKey="peso" stroke="#2378F3" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CaloriesChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid stroke="#E6EAF0" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#667085", fontSize: 12 }} />
        <YAxis tick={{ fill: "#667085", fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="consumido" fill="#2378F3" radius={[6, 6, 0, 0]} />
        <Bar dataKey="planejado" fill="#5A9BF7" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MacrosChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid stroke="#E6EAF0" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#667085", fontSize: 12 }} />
        <YAxis tick={{ fill: "#667085", fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="proteína" fill="#17A673" radius={[6, 6, 0, 0]} />
        <Bar dataKey="carbo" fill="#2378F3" radius={[6, 6, 0, 0]} />
        <Bar dataKey="gordura" fill="#D99B21" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SleepChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid stroke="#E6EAF0" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#667085", fontSize: 12 }} />
        <YAxis tick={{ fill: "#667085", fontSize: 12 }} />
        <Tooltip />
        <Area type="monotone" dataKey="horas" stroke="#2378F3" fill="#eaf2fe" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CardioChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid stroke="#E6EAF0" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#667085", fontSize: 12 }} />
        <YAxis tick={{ fill: "#667085", fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="minutos" fill="#5A9BF7" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
