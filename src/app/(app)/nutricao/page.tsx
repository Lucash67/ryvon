import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MetricList, MetricRow, SectionHeader } from "@/components/v8";
import { requireSession } from "@/lib/auth";
import { loadNutritionPage } from "@/services/loaders";
import { formatNumber, parseDate } from "@/utils/dates";
import { WEEKDAY_SHORT } from "@/domain/constants";
import { targetsForDay, visualCap } from "@/domain/adherence";

export default async function NutricaoPage() {
  const { supabase, user } = await requireSession();
  const data = await loadNutritionPage(supabase, user.id);
  const todayTargets = targetsForDay(
    data.today.log.day_type,
    {
      calories: data.settings.on_calories,
      protein: data.settings.on_protein,
      carbs: data.settings.on_carbs,
      fat: data.settings.on_fat,
    },
    {
      calories: data.settings.off_calories,
      protein: data.settings.off_protein,
      carbs: data.settings.off_carbs,
      fat: data.settings.off_fat,
    },
  );
  const plan = data.today.log.day_type === "on" ? data.settings.meal_plan.on : data.settings.meal_plan.off;
  const calPct = data.today.log.calories ? visualCap((data.today.log.calories ?? 0) / todayTargets.calories) * 100 : 0;

  return (
    <div>
      <PageHeader title="Nutrição" subtitle="Metas editáveis em Configurações. Registro diário é só de macros." />

      <div className="grid gap-[14px] lg:grid-cols-2">
        <Card className="hover:translate-y-0">
          <CardHeader>
            <CardTitle className="text-[17px]">Day On</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted uppercase">Meta diária</p>
            <p className="mt-1 text-[26px] font-black">{data.settings.on_calories} kcal</p>
            <p className="mt-1 text-[11px] text-muted">
              {data.settings.on_protein}g P · {data.settings.on_carbs}g C · {data.settings.on_fat}g G
            </p>
          </CardContent>
        </Card>
        <Card className="hover:translate-y-0">
          <CardHeader>
            <CardTitle className="text-[17px]">Day Off</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted uppercase">Meta diária</p>
            <p className="mt-1 text-[26px] font-black">{data.settings.off_calories} kcal</p>
            <p className="mt-1 text-[11px] text-muted">
              {data.settings.off_protein}g P · {data.settings.off_carbs}g C · {data.settings.off_fat}g G
            </p>
          </CardContent>
        </Card>
      </div>

      <SectionHeader title="Hoje vs meta" subtitle={data.today.log.day_type === "on" ? "Day On" : "Day Off"} />
      <Card className="hover:translate-y-0">
        <CardContent className="space-y-4 py-5">
          <div>
            <div className="flex items-end justify-between gap-2">
              <p className="text-[11px] text-muted uppercase">Calorias</p>
              <p className="text-sm font-semibold">
                {data.today.log.calories ?? "—"} / {todayTargets.calories} kcal
              </p>
            </div>
            <Progress className="mt-2" value={calPct} />
          </div>
          <MetricList>
            <MetricRow label="Proteína" value={`${data.today.log.protein ?? "—"} / ${todayTargets.protein} g`} />
            <MetricRow label="Carboidratos" value={`${data.today.log.carbs ?? "—"} / ${todayTargets.carbs} g`} />
            <MetricRow label="Gorduras" value={`${data.today.log.fat ?? "—"} / ${todayTargets.fat} g`} />
          </MetricList>
        </CardContent>
      </Card>

      <SectionHeader title={`Plano ${data.today.log.day_type === "on" ? "Day On" : "Day Off"}`} />
      <div className="space-y-3">
        {(plan ?? []).map((meal) => (
          <Card key={`${meal.name}-${meal.time}`} className="hover:translate-y-0">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-[17px]">{meal.name}</CardTitle>
              <Badge>{meal.time}</Badge>
            </CardHeader>
            <CardContent className="space-y-1 text-[11px] leading-relaxed text-muted">
              {meal.items.map((item) => (
                <p key={item.name}>
                  {item.quantity ? `${item.quantity} ` : ""}
                  {item.name}
                  {item.optional ? " (opcional)" : ""}
                </p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <SectionHeader title="Nutrição da semana" />
      <Card className="overflow-x-auto hover:translate-y-0">
        <CardContent className="py-5">
          <table className="w-full min-w-[560px] text-left text-[12px]">
            <thead className="text-muted">
              <tr>
                {["Dia", "Calorias", "C", "P", "G"].map((col) => (
                  <th key={col} className="pb-3 font-medium">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.snapshot.logs.map((log) => (
                <tr key={log.id} className="border-t border-border">
                  <td className="py-3 font-medium">{WEEKDAY_SHORT[parseDate(log.date).getDay()]}</td>
                  <td>{log.calories ?? "—"}</td>
                  <td>{log.carbs ?? "—"}</td>
                  <td>{log.protein ?? "—"}</td>
                  <td>{log.fat ?? "—"}</td>
                </tr>
              ))}
              <tr className="border-t border-border font-semibold">
                <td className="py-3">Média</td>
                <td>{formatNumber(data.snapshot.summary.calories_avg)}</td>
                <td>{formatNumber(data.snapshot.summary.carbs_avg)}</td>
                <td>{formatNumber(data.snapshot.summary.protein_avg)}</td>
                <td>{formatNumber(data.snapshot.summary.fat_avg)}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
