"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const CompareContext = createContext(null);
const STORAGE_KEY = "bbm_compare_products";
const MAX_COMPARE = 4;

export function CompareProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt/blocked storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage may be unavailable (private browsing) — compare still works for the session
    }
  }, [items, hydrated]);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      if (prev.some((p) => p._id === product._id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, product];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p._id !== id));
  }, []);

  const toggleItem = useCallback((product) => {
    setItems((prev) => {
      if (prev.some((p) => p._id === product._id)) return prev.filter((p) => p._id !== product._id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, product];
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return (
    <CompareContext.Provider value={{ items, addItem, removeItem, toggleItem, clear, max: MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
