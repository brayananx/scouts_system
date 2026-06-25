"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppHeader from "../components/AppHeader";
import { api } from "../lib/api";

export default function AttendancePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [activities, setActivities] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const loadActivities = async () => {
    const data = await api("/attendance/activities");

    setActivities(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const createActivity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !date) return;

    await api("/attendance/activities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        date,
        description,
      }),
    });

    setName("");
    setDate("");
    setDescription("");

    loadActivities();
  };

  return (
  <>
    <AppHeader />

    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          ← Volver
        </Link>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold">
            📋 Control de Asistencia
          </h1>

          <form
            onSubmit={createActivity}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de actividad"
              className="rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción"
              className="min-h-24 rounded-xl border border-slate-300 px-4 py-3 md:col-span-2"
            />

            <button
              type="submit"
              className="rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 md:col-span-2"
            >
              Crear actividad
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Actividades registradas
          </h2>

          <div className="mt-5 space-y-3">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                href={`/attendance/${activity.id}`}
                className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50"
              >
                <p className="font-semibold">
                  {activity.name}
                </p>

                <p className="text-sm text-slate-500">
                  {new Date(activity.date).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
    </>
  );
}