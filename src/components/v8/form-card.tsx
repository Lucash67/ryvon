import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/cn";

export function FormCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("hover:translate-y-0", className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-[17px]">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="pt-[14px]">{children}</CardContent>
    </Card>
  );
}

export function FormRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-1 gap-[10px] sm:grid-cols-2", className)}>{children}</div>;
}

export function FieldWrap({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-[11px] flex flex-col gap-1.5", className)}>
      <label className="text-[11px] font-medium text-muted">{label}</label>
      {children}
    </div>
  );
}
