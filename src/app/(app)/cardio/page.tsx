import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MetricCard, MetricList, MetricRow, MiniBarChart, SectionHeader } from "@/components/v8";
import { DomainEmptyState } from "@/components/v8/domain-empty-state";
import { requireSession } from "@/lib/auth";
import { loadWeekView } from "@/services/loaders";
import { CARDIO_LABELS, WEEKDAY_SHORT } from "@/domain/constants";
import { visualCap } from "@/domain/adherence";
import { formatNumber, parseDate } from "@/utils/dates";
import { average } from "@/utils/format";

export default async function CardioPage() {
  const { supabase, user } = await requireSession();
  const data = await loadWeekView(supabase, user.id);
  const total = data.snapshot.summary.cardio_total;
  const remaining = Math.max(data.settings.weekly_cardio_goal - total, 0);
  const rpe = average(data.snapshot.cardio.map((item) => item.rpe));
  const sessionsCount = data.snapshot.cardio.length;
  const barData = data.snapshot.logs.map((log) => ({
    label: WEEKDAY_SHORT[parseDate(log.date).getDay()],
    value: data.snapshot.cardio.filter((item) => item.daily_log_id === log.id).reduce((sum, item) => sum + item.minutes, 0),
  }));

  return (
    <div>
      <PageHeader
        title="Cardio"
        subtitle={`Meta semanal ${data.settings.weekly_cardio_goal} min · RPE recomendado ≥ ${data.settings.cardio_rpe_goal}`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Total min" value={`${total} min`} sub={`Meta ${data.settings.weekly_cardio_goal} min`} />
        <MetricCard label="Média RPE" value={rpe ? formatNumber(rpe, 1) : "—"} />
        <MetricCard
          label="Modalidade"
          value={data.snapshot.extras.cardioMode ? CARDIO_LABELS[data.snapshot.extras.cardioMode] : "—"}
        />
        <MetricCard label="Sessões" value={String(sessionsCount)} />
      </div>

      <SectionHeader title="Meta semanal" />
      <Card className="hover:translate-y-0">
        <CardContent className="py-5">
          <p className="text-[26px] font-black tracking-tight">
            {total} / {data.settings.weekly_cardio_goal} min
          </p>
          <Progress className="mt-4" value={visualCap(total / data.settings.weekly_cardio_goal) * 100} />
          <p className="mt-3 text-[11px] text-muted">
            {remaining > 0 ? `Faltam ${remaining} min para sua meta de cardio.` : "Meta semanal atingida."}
          </p>
        </CardContent>
      </Card>

      <SectionHeader title="Distribuição" subtitle="Minutos por dia e sessões registradas" />
      <div className="grid gap-[14px] lg:grid-cols-[1.4fr_0.6fr]">
        <Card className="hover:translate-y-0">
          <CardHeader>
            <CardTitle className="text-[17px]">Minutos por dia</CardTitle>
          </CardHeader>
          <CardContent className="h-[190px]">
            <MiniBarChart data={barData} />
          </CardContent>
        </Card>
        <Card className="hover:translate-y-0">
          <CardHeader>
            <CardTitle className="text-[17px]">Sessões da semana</CardTitle>
          </CardHeader>
          <CardContent>
            {data.snapshot.cardio.length ? (
              <MetricList>
                {data.snapshot.cardio.map((item) => {
                  const log = data.snapshot.logs.find((l) => l.id === item.daily_log_id);
                  return (
                    <MetricRow
                      key={item.id}
                      label={log ? WEEKDAY_SHORT[parseDate(log.date).getDay()] : "—"}
                      value={`${item.minutes} min · ${CARDIO_LABELS[item.type]} · RPE ${item.rpe ?? "—"}`}
                    />
                  );
                })}
              </MetricList>
            ) : (
              <DomainEmptyState domain="Cardio" title="Nenhuma sessão nesta semana." description="Registre cardio em Hoje ou pelo atalho Registrar." />
            )}
          </CardContent>
        </Card>
      </div>

      <p className="mt-4 text-[11px] text-muted">Nenhuma estimativa calórica é tratada como verdade neste módulo.</p>
    </div>
  );
}
