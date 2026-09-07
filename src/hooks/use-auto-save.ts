"use client";

import { useEffect, useRef, useState } from "react";
import type { SaveState } from "@/types";

export function useAutoSave<T>(
  value: T,
  save: (value: T) => Promise<void>,
  delay = 700,
) {
  const [state, setState] = useState<SaveState>("idle");
  const first = useRef(true);
  const latest = useRef(save);

  useEffect(() => {
    latest.current = save;
  }, [save]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setState("saving");
    const timeout = setTimeout(() => {
      latest
        .current(value)
        .then(() => setState("saved"))
        .catch(() => setState("error"));
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return state;
}

export function saveLabel(state: SaveState) {
  switch (state) {
    case "saving":
      return "Salvando...";
    case "saved":
      return "Salvo";
    case "error":
      return "Erro ao salvar";
    default:
      return "";
  }
}
