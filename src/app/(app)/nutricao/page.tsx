import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireSession } from "@/lib/auth";
import { loadNutritionPage } from "@/services/loaders";
import { formatNumber } from "@/utils/dates";
import { targetsForDay } from "@/domain/adherence";

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

  return (
    <div>
      <PageHeader title="Nutrição" subtitle="Metas editáveis em Configurações. Registro diário é só de macros." />
      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Day On</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted">
            {data.settings.on_calories} kcal · {data.settings.on_protein}g P · {data.settings.on_carbs}g C · {data.settings.on_fat}g G
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Day Off</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted">
            {data.settings.off_calories} kcal · {data.settings.off_protein}g P · {data.settings.off_carbs}g C · {data.settings.off_fat}g G
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Hoje vs meta</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 text-sm">
          <p>Calorias {data.today.log.calories ?? "—"} / {todayTargets.calories}</p>
          <p>Proteína {data.today.log.protein ?? "—"} / {todayTargets.protein}</p>
          <p>Carbo {data.today.log.carbs ?? "—"} / {todayTargets.carbs}</p>
          <p>Gordura {data.today.log.fat ?? "—"} / {todayTargets.fat}</p>
        </CardContent>
      </Card>

      <div className="mt-4 space-y-3">
        <h2 className="text-lg font-semibold">Plano {data.today.log.day_type === "on" ? "Day On" : "Day Off"}</h2>
        {(plan ?? []).map((meal) => (
          <Card key={`${meal.name}-${meal.time}`}>
            <CardHeader>
              <CardTitle>{meal.name}</CardTitle>
              <Badge>{meal.time}</Badge>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted">
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

      <Card className="mt-6 overflow-x-auto">
        <CardHeader>
          <CardTitle>Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3">Dia</th>
                <th>Calorias</th>
                <th>C</th>
                <th>P</th>
                <th>G</th>
              </tr>
            </thead>
            <tbody>
              {data.snapshot.logs.map((log) => (
                <tr key={log.id} className="border-t border-border">
                  <td className="py-3">{log.date}</td>
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
