import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintButton } from "@/components/print-button";
import { requireSession } from "@/lib/auth";
import { loadWeekView } from "@/services/loaders";
import { verdictLabel } from "@/domain/scores";
import { formatNumber, minutesToHoursLabel, weekRangeLabel } from "@/utils/dates";
import { pct } from "@/utils/format";

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

      <section className="space-y-4">
        <Block title="Veredito geral">
          <p className="text-3xl font-semibold">{verdictLabel(data.snapshot.verdict)}</p>
          <p className="mt-2 text-sm text-muted">Score {report.general} / 10</p>
        </Block>
        <Block title="Execução">
          <p>Aderência geral {pct(data.snapshot.adherence.general)}</p>
          <p>Dias registrados: {summary.days_logged}</p>
        </Block>
        <Block title="Treino">
          <p>
            {summary.workouts_completed}/{summary.workouts_planned} concluídos · {summary.workouts_missed} perdidos
          </p>
          <p>Score {report.training}</p>
        </Block>
        <Block title="Nutrição">
          <p>Média {formatNumber(summary.calories_avg)} kcal · proteína {formatNumber(summary.protein_avg)} g</p>
          <p>
            Dias na faixa de calorias: {summary.calorie_days_in_range} · proteína: {summary.protein_days_in_range}
          </p>
        </Block>
        <Block title="Cardio">
          <p>
            {summary.cardio_total} min totais · média diária {formatNumber(summary.cardio_avg)} min
          </p>
        </Block>
        <Block title="Sono">
          <p>Média {minutesToHoursLabel(summary.sleep_avg_minutes)}</p>
        </Block>
        <Block title="Indicadores">
          <p>Treino {pct(data.snapshot.adherence.training)}</p>
          <p>Nutrição {pct(data.snapshot.adherence.nutrition)}</p>
          <p>Sono {pct(data.snapshot.adherence.sleep)}</p>
          <p>Cardio {pct(data.snapshot.adherence.cardio)}</p>
          <p>Rotina {pct(data.snapshot.adherence.routine)}</p>
        </Block>
        <Block title="Leitura da semana">
          <p>{summary.reading}</p>
        </Block>
        <Block title="Principais conclusões">
          <ul className="list-disc space-y-1 pl-5">
            {summary.conclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Block>
        <Block title="Prioridades próxima semana">
          <ul className="list-disc space-y-1 pl-5">
            {summary.priorities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Block>
        <Block title="Comparação">
          {data.prevSnapshot ? (
            <p>
              Sono {minutesToHoursLabel(summary.sleep_avg_minutes)} vs {minutesToHoursLabel(data.prevSnapshot.summary.sleep_avg_minutes)} ·
              Cardio {summary.cardio_total} vs {data.prevSnapshot.summary.cardio_total} ·
              Proteína {formatNumber(summary.protein_avg)} vs {formatNumber(data.prevSnapshot.summary.protein_avg)}
            </p>
          ) : (
            <p>Semana anterior ainda não possui dados suficientes.</p>
          )}
        </Block>
      </section>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm leading-6">{children}</CardContent>
    </Card>
  );
}
