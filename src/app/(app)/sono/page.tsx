import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartCard, SleepChart } from "@/components/charts/simple-charts";
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

  return (
    <div>
      <PageHeader title="Sono" subtitle={`Meta ${minutesToHoursLabel(data.settings.sleep_goal_minutes)}`} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="py-5">
            <p className="text-xs text-muted">Média</p>
            <p className="mt-2 text-2xl font-semibold">{minutesToHoursLabel(data.snapshot.summary.sleep_avg_minutes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-xs text-muted">Mínimo</p>
            <p className="mt-2 text-2xl font-semibold">{minutesToHoursLabel(min)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-xs text-muted">Máximo</p>
            <p className="mt-2 text-2xl font-semibold">{minutesToHoursLabel(max)}</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <ChartCard title="Horas por noite">
          <SleepChart
            data={data.snapshot.logs.map((log) => ({
              label: WEEKDAY_SHORT[parseDate(log.date).getDay()],
              horas: log.sleep_minutes ? Number((log.sleep_minutes / 60).toFixed(1)) : 0,
            }))}
          />
        </ChartCard>
      </div>
      <div className="mt-4 space-y-2">
        {data.snapshot.logs.map((log) => {
          const tone = sleepTone(log.sleep_minutes);
          return (
            <div key={log.id} className="surface-muted flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <div>
                <p className="font-medium">{WEEKDAY_SHORT[parseDate(log.date).getDay()]}</p>
                <p className="text-sm text-muted">
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
