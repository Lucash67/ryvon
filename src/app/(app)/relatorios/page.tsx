import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintButton } from "@/components/print-button";
import {
  ConclusionPill,
  MetricList,
  MetricRow,
  ReportReading,
  ScoreStrip,
  SectionHeader,
} from "@/components/v8";
import { requireSession } from "@/lib/auth";
import { loadWeekView } from "@/services/loaders";
import { verdictLabel } from "@/domain/scores";
import { formatNumber, minutesToHoursLabel, weekRangeLabel } from "@/utils/dates";
import { pct, scoreLabel } from "@/utils/format";

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const { supabase, user } = await requireSession();
  const params = await searchParams;
  const data = await loadWeekView(supabase, user.id, params.w ? Number(params.w) : undefined);
  const report = data.snapshot.scores;
  const summary = data.snapshot.summary;

  return (
    <div className="print:max-w-none">
      <PageHeader
        title={`Relatório · Semana ${data.week.week_number}`}
        subtitle={weekRangeLabel(data.week.start_date, data.week.end_date)}
        action={<PrintButton />}
      />

      <ScoreStrip
        className="mb-[14px]"
        items={[
          { label: "Geral", value: scoreLabel(report.general) },
          { label: "Treino", value: scoreLabel(report.training) },
          { label: "Nutrição", value: scoreLabel(report.nutrition) },
          { label: "Cardio", value: scoreLabel(report.cardio) },
          { label: "Sono", value: scoreLabel(report.sleep) },
          { label: "Rotina", value: scoreLabel(report.routine) },
        ]}
      />

      <div className="grid gap-[14px] lg:grid-cols-2">
        <Card className="hover:translate-y-0">
          <CardHeader>
            <CardTitle className="text-[17px]">Veredito geral</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted uppercase">Semana {data.week.week_number}</p>
            <p className="mt-1 text-[29px] font-black tracking-tight">{verdictLabel(data.snapshot.verdict)}</p>
            <p className="mt-2 text-[11px] text-muted">Score {report.general} / 10 · Aderência {pct(data.snapshot.adherence.general)}</p>
            <MetricList className="mt-4">
              <MetricRow label="Dias registrados" value={String(summary.days_logged)} />
              <MetricRow label="Treinos" value={`${summary.workouts_completed}/${summary.workouts_planned}`} />
              <MetricRow label="Cardio" value={`${summary.cardio_total} min`} />
              <MetricRow label="Sono médio" value={minutesToHoursLabel(summary.sleep_avg_minutes)} />
              <MetricRow label="Proteína média" value={`${formatNumber(summary.protein_avg)} g`} />
            </MetricList>
          </CardContent>
        </Card>

        <Card className="hover:translate-y-0">
          <CardHeader>
            <CardTitle className="text-[17px]">Prioridades próxima semana</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricList>
              {summary.priorities.length ? (
                summary.priorities.map((item) => <MetricRow key={item} label="Ação" value={item} />)
              ) : (
                <p className="text-[11px] text-muted">Sem prioridades automáticas para esta semana.</p>
              )}
            </MetricList>
          </CardContent>
        </Card>
      </div>

      <SectionHeader title="Leitura da semana" />
      <div className="grid gap-[14px] lg:grid-cols-2">
        <Card className="hover:translate-y-0">
          <CardContent className="py-5">
            <ReportReading>{summary.reading}</ReportReading>
          </CardContent>
        </Card>
        <Card className="hover:translate-y-0">
          <CardHeader>
            <CardTitle className="text-[17px]">Principais conclusões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.conclusions.map((item) => (
              <ConclusionPill key={item}>{item}</ConclusionPill>
            ))}
          </CardContent>
        </Card>
      </div>

      <SectionHeader title="Comparação com anterior" />
      <Card className="hover:translate-y-0">
        <CardContent className="py-5">
          {data.prevSnapshot ? (
            <MetricList>
              <MetricRow
                label="Sono"
                value={`${minutesToHoursLabel(summary.sleep_avg_minutes)} → ${minutesToHoursLabel(data.prevSnapshot.summary.sleep_avg_minutes)}`}
              />
              <MetricRow
                label="Cardio"
                value={`${summary.cardio_total} min → ${data.prevSnapshot.summary.cardio_total} min`}
              />
              <MetricRow
                label="Proteína"
                value={`${formatNumber(summary.protein_avg)} g → ${formatNumber(data.prevSnapshot.summary.protein_avg)} g`}
              />
            </MetricList>
          ) : (
            <p className="text-[11px] text-muted">Semana anterior ainda não possui dados suficientes.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
