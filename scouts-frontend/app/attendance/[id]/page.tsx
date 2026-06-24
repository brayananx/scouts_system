"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

export default function AttendanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [activity, setActivity] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  const loadActivity = async () => {
    const res = await fetch(`${API_URL}/attendance/activities/${id}`);
    const data = await res.json();

    setActivity(data.activity);
    setUsers(Array.isArray(data.users) ? data.users : []);
    setAttendance(Array.isArray(data.attendance) ? data.attendance : []);
  };

  useEffect(() => {
    loadActivity();
  }, [id, API_URL]);

  const isPresent = (userId: string) => {
    return attendance.find((a: any) => a.userId === userId)?.present || false;
  };

  const markAttendance = async (userId: string, present: boolean) => {
    await fetch(`${API_URL}/attendance/mark`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activityId: id,
        userId,
        present,
      }),
    });

    loadActivity();
  };

  if (!activity) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <p>Cargando asistencia...</p>
      </main>
    );
  }

  const activeUserIds = users.map((u: any) => u.id);

  const activeAttendance = attendance.filter((a: any) =>
    activeUserIds.includes(a.userId)
  );

  const presentCount = activeAttendance.filter((a: any) => a.present).length;

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/attendance"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          ← Volver a actividades
        </Link>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">
            Control de asistencia
          </p>

          <h1 className="mt-2 text-3xl font-bold">{activity.name}</h1>

          <p className="mt-2 text-slate-500">
            Fecha: {new Date(activity.date).toLocaleDateString()}
          </p>

          {activity.description && (
            <p className="mt-2 text-slate-600">{activity.description}</p>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-emerald-100 p-4">
              <p className="text-sm text-emerald-700">Presentes</p>
              <p className="text-3xl font-bold text-emerald-900">
                {presentCount}
              </p>
            </div>

            <div className="rounded-xl bg-red-100 p-4">
              <p className="text-sm text-red-700">Ausentes</p>
              <p className="text-3xl font-bold text-red-900">
                {users.length - presentCount}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Total scouts</p>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Lista de scouts</h2>

          <div className="mt-5 max-h-[650px] space-y-3 overflow-y-auto pr-2">
            {users.map((user: any) => {
              const present = isPresent(user.id);

              return (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{user.name}</p>

                      {user.isActive === false && (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                          Inactivo
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-500">
                      {user.patrol?.name || "Sin patrulla"}
                    </p>

                    {user.isActive === false && user.inactiveReason && (
                      <p className="mt-1 text-xs text-red-600">
                        {user.inactiveReason}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => markAttendance(user.id, true)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                        present
                          ? "bg-emerald-700 text-white"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      }`}
                    >
                      Presente
                    </button>

                    <button
                      onClick={() => markAttendance(user.id, false)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                        !present
                          ? "bg-red-600 text-white"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      Ausente
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}