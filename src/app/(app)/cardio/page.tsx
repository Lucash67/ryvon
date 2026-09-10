import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
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

  return (
    <div>
      <PageHeader title="Cardio" subtitle={`Meta semanal ${data.settings.weekly_cardio_goal} min · RPE recomendado ≥ ${data.settings.cardio_rpe_goal}`} />
      <Card>
        <CardContent className="py-6">
          <p className="text-3xl font-semibold">
            {total} / {data.settings.weekly_cardio_goal} min
          </p>
          <Progress className="mt-4" value={visualCap(total / data.settings.weekly_cardio_goal) * 100} />
          <p className="mt-3 text-sm text-muted">
            {remaining > 0 ? `Faltam ${remaining} min para sua meta de cardio.` : "Meta semanal atingida."}
          </p>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="py-5">
            <p className="text-xs text-muted">Média RPE</p>
            <p className="mt-2 text-2xl font-semibold">{rpe ? formatNumber(rpe, 1) : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-xs text-muted">Modalidade mais usada</p>
            <p className="mt-2 text-2xl font-semibold">
              {data.snapshot.extras.cardioMode ? CARDIO_LABELS[data.snapshot.extras.cardioMode] : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Sessões da semana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.snapshot.logs.map((log) => {
            const sessions = data.snapshot.cardio.filter((item) => item.daily_log_id === log.id);
            return (
              <div key={log.id} className="surface-muted flex items-center justify-between rounded-xl px-3 py-3 text-sm">
                <span>{WEEKDAY_SHORT[parseDate(log.date).getDay()]}</span>
                <span>
                  {sessions.length
                    ? sessions.map((item) => `${item.minutes} ${CARDIO_LABELS[item.type]}`).join(" · ")
                    : "0"}
                </span>
              </div>
            );
          })}
          {!data.snapshot.cardio.length ? (
            <EmptyState title="Nenhuma sessão nesta semana." actionLabel="Adicionar cardio" />
          ) : null}
        </CardContent>
      </Card>
      <p className="mt-4 text-xs text-muted">Nenhuma estimativa calórica é tratada como verdade neste módulo.</p>
    </div>
  );
}
