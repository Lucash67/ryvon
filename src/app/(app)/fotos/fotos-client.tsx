"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
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
      <Card>
        <CardHeader>
          <CardTitle>Enviar foto</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-2"
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
            <Button type="submit">Enviar</Button>
          </form>
        </CardContent>
      </Card>

      {photos.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Nenhuma foto enviada ainda." />
        </div>
      ) : (
        <>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Comparar</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
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
              <PhotoColumn title={a} photos={photos.filter((photo) => photo.date === a)} />
              <PhotoColumn title={b} photos={photos.filter((photo) => photo.date === b)} />
            </CardContent>
          </Card>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <Card key={photo.id}>
                <CardContent className="py-4">
                  {photo.signed_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo.signed_url} alt={photo.category} className="mb-3 h-56 w-full rounded-xl object-cover" />
                  ) : null}
                  <p className="text-sm font-medium">{PHOTO_CATEGORY_LABELS[photo.category]}</p>
                  <p className="text-xs text-muted">{photo.date}{photo.weight ? ` · ${photo.weight} kg` : ""}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PhotoColumn({ title, photos }: { title: string; photos: ProgressPhoto[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title || "—"}</p>
      <div className="space-y-2">
        {photos.map((photo) =>
          photo.signed_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={photo.id} src={photo.signed_url} alt={title} className="h-64 w-full rounded-xl object-cover" />
          ) : null,
        )}
      </div>
    </div>
  );
}
