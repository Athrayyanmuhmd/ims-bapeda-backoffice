"use client";

import { useCallback, useEffect, useState } from "react";
import { todayIsoDate } from "@/utils/datetime";

export type NotifKind = "pendingIzin" | "belumAbsen" | "endingSoon";

type DismissedMap = {
  pendingIzin: string[];
  /** `${pesertaId}:${yyyy-mm-dd}` — expires next calendar day */
  belumAbsen: string[];
  /** `${pesertaId}:${tanggalSelesaiIsoDate}` — resurfaces if period changes */
  endingSoon: string[];
};

const EMPTY: DismissedMap = {
  pendingIzin: [],
  belumAbsen: [],
  endingSoon: [],
};

const storageKey = (userId: string) => `simagang:notif-seen:${userId}`;

function readStore(userId: string): DismissedMap {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<DismissedMap>;
    return {
      pendingIzin: Array.isArray(parsed.pendingIzin) ? parsed.pendingIzin : [],
      belumAbsen: Array.isArray(parsed.belumAbsen) ? parsed.belumAbsen : [],
      endingSoon: Array.isArray(parsed.endingSoon) ? parsed.endingSoon : [],
    };
  } catch {
    return EMPTY;
  }
}

function writeStore(userId: string, next: DismissedMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
}

/** Drop stale "belum absen" entries from previous days. */
function prune(map: DismissedMap): DismissedMap {
  const today = todayIsoDate();
  const belumAbsen = map.belumAbsen.filter((key) => key.endsWith(`:${today}`));
  if (belumAbsen.length === map.belumAbsen.length) return map;
  return { ...map, belumAbsen };
}

export function belumAbsenKey(pesertaId: string) {
  return `${pesertaId}:${todayIsoDate()}`;
}

export function endingSoonKey(pesertaId: string, tanggalSelesai: string) {
  return `${pesertaId}:${tanggalSelesai.slice(0, 10)}`;
}

export function useNotifSeen(userId: string | undefined) {
  const [dismissed, setDismissed] = useState<DismissedMap>(EMPTY);

  useEffect(() => {
    if (!userId) {
      setDismissed(EMPTY);
      return;
    }
    const next = prune(readStore(userId));
    setDismissed(next);
    writeStore(userId, next);
  }, [userId]);

  const isSeen = useCallback(
    (kind: NotifKind, key: string) => dismissed[kind].includes(key),
    [dismissed]
  );

  const markSeen = useCallback(
    (kind: NotifKind, key: string) => {
      if (!userId) return;
      setDismissed((prev) => {
        if (prev[kind].includes(key)) return prev;
        const next = { ...prev, [kind]: [...prev[kind], key] };
        writeStore(userId, next);
        return next;
      });
    },
    [userId]
  );

  const markManySeen = useCallback(
    (entries: { kind: NotifKind; key: string }[]) => {
      if (!userId || entries.length === 0) return;
      setDismissed((prev) => {
        const next: DismissedMap = {
          pendingIzin: [...prev.pendingIzin],
          belumAbsen: [...prev.belumAbsen],
          endingSoon: [...prev.endingSoon],
        };
        for (const { kind, key } of entries) {
          if (!next[kind].includes(key)) next[kind].push(key);
        }
        writeStore(userId, next);
        return next;
      });
    },
    [userId]
  );

  return { isSeen, markSeen, markManySeen };
}
