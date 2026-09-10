"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { DomainEmptyState, FormCard, SectionHeader } from "@/components/v8";
import { uploadPhotoAction } from "@/app/actions";
import { PHOTO_CATEGORY_LABELS } from "@/domain/constants";
import type { ProgressPhoto } from "@/types";

export function FotosClient({ photos }: { photos: ProgressPhoto[] }) {
  const dates = useMemo(() => [...new Set(photos.map((photo) => photo.date))], [photos]);
  const [a, setA] = useState(dates[1] ?? dates[0] ?? "");
  const [b, setB] = useState(dates[0] ?? "");

  return (
    <div>
      <PageHeader title="Fotos" subtitle="Comparador lado a lado. Categorias por pose." />

      <FormCard title="Nova foto">
        <form
          className="grid grid-cols-2 gap-[10px] lg:grid-cols-4"
          action={async (formData) => {
            await uploadPhotoAction(formData);
          }}
        >
          <div>
            <Label>Data</Label>
            <Input name="date" type="date" required />
          </div>
          <div>
            <Label>Categoria</Label>
            <select name="category" className="h-11 w-full rounded-xl border border-border px-3">
              {Object.entries(PHOTO_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Peso</Label>
            <Input name="weight" type="number" inputMode="decimal" step="0.1" />
          </div>
          <div>
            <Label>Arquivo</Label>
            <Input name="file" type="file" accept="image/*" required />
          </div>
          <Button type="submit" className="col-span-2 lg:col-span-4">Enviar</Button>
        </form>
      </FormCard>

      {photos.length === 0 ? (
        <div className="mt-4">
          <DomainEmptyState domain="Fotos" title="Nenhuma foto enviada ainda." description="Envie fotos de progresso para comparar evolução visual." />
        </div>
      ) : (
        <>
          <SectionHeader title="Comparador" />
          <FormCard title="Selecione duas datas">
            <div className="grid gap-3 lg:grid-cols-2">
              <div>
                <Label>Data A</Label>
                <select value={a} onChange={(e) => setA(e.target.value)} className="h-11 w-full rounded-xl border border-border px-3">
                  {dates.map((date) => <option key={date}>{date}</option>)}
                </select>
              </div>
              <div>
                <Label>Data B</Label>
                <select value={b} onChange={(e) => setB(e.target.value)} className="h-11 w-full rounded-xl border border-border px-3">
                  {dates.map((date) => <option key={date}>{date}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <PhotoColumn title={a} photos={photos.filter((photo) => photo.date === a)} />
              <PhotoColumn title={b} photos={photos.filter((photo) => photo.date === b)} />
            </div>
          </FormCard>

          <SectionHeader title="Histórico visual" />
          <div className="grid grid-cols-2 gap-[10px] lg:grid-cols-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-[17px] border border-border bg-surface-2 p-[11px]"
                style={{ aspectRatio: "3/4" }}
              >
                {photo.signed_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.signed_url} alt={photo.category} className="h-full w-full rounded-xl object-cover" />
                ) : null}
                <p className="mt-2 text-[11px] font-semibold">{PHOTO_CATEGORY_LABELS[photo.category]}</p>
                <p className="text-[10px] text-muted">{photo.date}{photo.weight ? ` · ${photo.weight} kg` : ""}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PhotoColumn({ title, photos }: { title: string; photos: ProgressPhoto[] }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-border bg-surface-2 p-3" style={{ aspectRatio: "3/4" }}>
      <p className="mb-2 text-[11px] font-semibold text-muted">{title || "—"}</p>
      <div className="space-y-2">
        {photos.map((photo) =>
          photo.signed_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={photo.id} src={photo.signed_url} alt={title} className="h-full max-h-[320px] w-full rounded-xl object-cover" />
          ) : null,
        )}
      </div>
    </div>
  );
}
