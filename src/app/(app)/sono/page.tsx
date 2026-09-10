import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ChartCard, SleepChart } from "@/components/charts/simple-charts";
import { MetricCard, SectionHeader } from "@/components/v8";
import { requireSession } from "@/lib/auth";
import { loadWeekView } from "@/services/loaders";
import { sleepTone } from "@/domain/sleep";
import { WEEKDAY_SHORT } from "@/domain/constants";
import { minutesToHoursLabel, parseDate } from "@/utils/dates";

export default async function SonoPage() {
  const { supabase, user } = await requireSession();
  const data = await loadWeekView(supabase, user.id);
  const values = data.snapshot.logs.map((log) => log.sleep_minutes).filter((value): value is number => value != null);
  const min = values.length ? Math.min(...values) : null;
  const max = values.length ? Math.max(...values) : null;
  const chartData = data.snapshot.logs.map((log) => ({
    label: WEEKDAY_SHORT[parseDate(log.date).getDay()],
    horas: log.sleep_minutes ? Number((log.sleep_minutes / 60).toFixed(1)) : 0,
  }));

  return (
    <div>
      <PageHeader title="Sono" subtitle={`Meta ${minutesToHoursLabel(data.settings.sleep_goal_minutes)}`} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Média" value={minutesToHoursLabel(data.snapshot.summary.sleep_avg_minutes)} />
        <MetricCard label="Mínimo" value={minutesToHoursLabel(min)} />
        <MetricCard label="Máximo" value={minutesToHoursLabel(max)} />
        <MetricCard label="Meta" value={minutesToHoursLabel(data.settings.sleep_goal_minutes)} />
      </div>

      <SectionHeader title="Horas por noite" />
      <ChartCard title="Distribuição semanal">
        <SleepChart data={chartData} />
      </ChartCard>

      <div className="mt-3 flex flex-wrap gap-[14px] text-[10px] text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-danger" /> &lt;6h</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" /> 6–7h</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> ≥7h</span>
      </div>

      <SectionHeader title="Detalhe por dia" />
      <div className="space-y-2">
        {data.snapshot.logs.map((log) => {
          const tone = sleepTone(log.sleep_minutes);
          return (
            <div key={log.id} className="flex items-center justify-between rounded-[14px] border border-border bg-surface-2 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{WEEKDAY_SHORT[parseDate(log.date).getDay()]}</p>
                <p className="text-[11px] text-muted">
                  {log.sleep_start?.slice(0, 5) ?? "—"} → {log.sleep_end?.slice(0, 5) ?? "—"}
                </p>
              </div>
              <Badge tone={tone === "success" ? "success" : tone === "warning" ? "warning" : tone === "danger" ? "danger" : "neutral"}>
                {minutesToHoursLabel(log.sleep_minutes)}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
