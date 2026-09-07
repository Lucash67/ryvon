import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/nutricao", label: "Nutrição" },
  { href: "/cardio", label: "Cardio" },
  { href: "/sono", label: "Sono" },
  { href: "/fotos", label: "Fotos" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/configuracoes", label: "Configurações" },
];

export default function MaisPage() {
  return (
    <div>
      <PageHeader title="Mais" subtitle="Atalhos do painel." />
      <div className="space-y-2">
        {links.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card>
              <CardContent className="py-4 text-sm font-medium">{item.label}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
