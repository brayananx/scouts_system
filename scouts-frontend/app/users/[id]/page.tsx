"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";


export default function UserProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [user, setUser] = useState<any>(null);

  const [inactiveReason, setInactiveReason] = useState("");
  const [patrols, setPatrols] = useState<any[]>([]);
  const [selectedPatrolId, setSelectedPatrolId] = useState(""); 

  const [progressType, setProgressType] = useState<"COMPASS" | "LOGBOOK">(
    "COMPASS"
  );
  const [progressLevel, setProgressLevel] = useState("1");
  const [progressDate, setProgressDate] = useState("");

  const [specialties, setSpecialties] = useState<any[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [specialtyDate, setSpecialtyDate] = useState("");

  const loadUser = async () => {
    const res = await fetch(`${API_URL}/users/${id}`);

    if (!res.ok) {
      console.error("Error cargando usuario:", res.status);
      return;
    }

    const data = await res.json();
    setUser(data);
    setInactiveReason(data.inactiveReason || "");
    setSelectedPatrolId(data.patrolId || "");
  };
  const loadPatrols = async () => {
      const res = await fetch(`${API_URL}/patrols`);
      const data = await res.json();

      setPatrols(Array.isArray(data) ? data : []);
    };

  const loadSpecialties = async () => {
    const res = await fetch(`${API_URL}/specialties`);
    const data = await res.json();

    setSpecialties(Array.isArray(data) ? data : []);
  };
  const updatePatrol = async () => {
    if (!selectedPatrolId) return;

    await fetch(`${API_URL}/users/assign-patrol`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: id,
        patrolId: selectedPatrolId,
      }),
    });

    loadUser();
  };

  useEffect(() => {
    loadUser();
    loadSpecialties();
    loadPatrols();
  }, [id, API_URL]);

  const addProgress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!progressDate) return;

    await fetch(`${API_URL}/users/${id}/progress-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: progressType,
        level: Number(progressLevel),
        obtainedDate: progressDate,
      }),
    });

    setProgressType("COMPASS");
    setProgressLevel("1");
    setProgressDate("");

    loadUser();
  };

  const removeProgress = async (progressId: string) => {
    await fetch(`${API_URL}/users/progress-history/${progressId}`, {
      method: "DELETE",
    });

    loadUser();
  };

  const addSpecialty = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSpecialty || !specialtyDate) return;

    await fetch(`${API_URL}/specialties/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: id,
        specialtyId: selectedSpecialty,
        obtainedDate: specialtyDate,
      }),
    });

    setSelectedSpecialty("");
    setSpecialtyDate("");

    loadUser();
  };

  const removeSpecialty = async (userSpecialtyId: string) => {
    await fetch(`${API_URL}/specialties/user-specialty/${userSpecialtyId}`, {
      method: "DELETE",
    });

    loadUser();
  };

  const updateUserStatus = async (isActive: boolean) => {
      await fetch(`${API_URL}/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive,
          inactiveReason: isActive ? undefined : inactiveReason,
        }),
      });

      loadUser();
    };

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <p>Cargando perfil...</p>
      </main>
    );
  }

  const compassProgress =
    user.progress?.filter((item: any) => item.type === "COMPASS") || [];

  const logbookProgress =
    user.progress?.filter((item: any) => item.type === "LOGBOOK") || [];
    const scoutHistory = [
    ...(user.progress || []).map((item: any) => ({
        id: item.id,
        date: item.obtainedDate,
        title:
        item.type === "COMPASS"
            ? `Obtuvo Brújula ${item.level}`
            : `Obtuvo Bitácora ${item.level}`,
        icon: item.type === "COMPASS" ? "🧭" : "📖",
    })),

    ...(user.specialties || []).map((item: any) => ({
        id: item.id,
        date: item.obtainedDate,
        title: `Obtuvo la especialidad ${item.specialty.name}`,
        icon: "🏅",
    })),
    ].sort(
    (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap gap-3">
  <Link
    href="/"
    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
  >
    ← Volver
  </Link>

  <Link
    href={`/users/${id}/medical`}
    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
  >
    🩺 Ficha Médica
  </Link>

  <a
    href={`${API_URL}/users/${id}/history-pdf`}
    target="_blank"
    className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
  >
    📄 Descargar PDF
  </a>
</div>

        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">👤 {user.name}</h1>
          <div className="mt-4 rounded-2xl border border-slate-200 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Estado del scout</p>

                  <p
                    className={`mt-1 text-lg font-bold ${
                      user.isActive === false ? "text-red-700" : "text-emerald-700"
                    }`}
                  >
                    {user.isActive === false ? "Inactivo" : "Activo"}
                  </p>

                  {user.inactiveDate && (
                    <p className="text-sm text-slate-500">
                      Fecha de inactividad: {formatDate(user.inactiveDate)}
                    </p>
                  )}
                </div>

                {user.isActive === false ? (
                  <button
                    onClick={() => updateUserStatus(true)}
                    className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
                  >
                    Reactivar scout
                  </button>
                ) : (
                  <button
                    onClick={() => updateUserStatus(false)}
                    className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Marcar inactivo
                  </button>
                )}
              </div>

              {user.isActive !== false && (
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-slate-600">
                    Razón de inactividad
                  </label>

                  <textarea
                    value={inactiveReason}
                    onChange={(e) => setInactiveReason(e.target.value)}
                    placeholder="Ej: Se trasladó de grupo, dejó de asistir, cambio de residencia..."
                    className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-red-600"
                  />
                </div>
              )}

              {user.isActive === false && user.inactiveReason && (
                <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">
                  <strong>Razón:</strong> {user.inactiveReason}
                </div>
              )}
            </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Correo</p>
              <p className="font-semibold">{user.email}</p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Identidad</p>
              <p className="font-semibold">{user.identityNumber}</p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Fecha nacimiento</p>
              <p className="font-semibold">
                {user.birthDate ? formatDate(user.birthDate) : "-"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Fecha ingreso</p>
              <p className="font-semibold">
                {user.joinDate ? formatDate(user.joinDate) : "-"}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-100 p-4 md:col-span-2">
              <p className="text-sm text-emerald-700">Patrulla actual</p>
              <p className="font-semibold text-emerald-900">
                {user.patrol?.name || "Sin patrulla"}
              </p>

              <div className="mt-4 flex flex-col gap-3 md:flex-row">
                <select
                  value={selectedPatrolId}
                  onChange={(e) => setSelectedPatrolId(e.target.value)}
                  className="w-full rounded-xl border border-emerald-300 px-4 py-3 text-sm outline-none focus:border-emerald-700"
                >
                  <option value="">Seleccionar patrulla</option>

                  {patrols.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={updatePatrol}
                  className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                  Guardar patrulla
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-bold">Progresión Scout</h2>
            <p className="mt-1 text-sm text-slate-500">
              Agrega brújulas y bitácoras obtenidas con su fecha.
            </p>

            <form
              onSubmit={addProgress}
              className="mt-6 grid gap-4 rounded-2xl border border-slate-200 p-5 md:grid-cols-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Tipo
                </label>
                <select
                  value={progressType}
                  onChange={(e) =>
                    setProgressType(e.target.value as "COMPASS" | "LOGBOOK")
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                >
                  <option value="COMPASS">Brújula</option>
                  <option value="LOGBOOK">Bitácora</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Nivel
                </label>
                <select
                  value={progressLevel}
                  onChange={(e) => setProgressLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                >
                  <option value="1">Nivel 1</option>
                  <option value="2">Nivel 2</option>
                  <option value="3">Nivel 3</option>
                  <option value="4">Nivel 4</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Fecha obtenida
                </label>
                <input
                  type="date"
                  value={progressDate}
                  onChange={(e) => setProgressDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
                >
                  Agregar
                </button>
              </div>
            </form>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="text-xl font-bold">🧭 Brújulas obtenidas</h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {compassProgress.length === 0 && (
                    <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-500">
                      No hay brújulas registradas.
                    </p>
                  )}

                  {compassProgress.map((item: any) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 p-5 text-center"
                    >
                      <img
                        src={`/brujulas/brujula-${item.level}.png`}
                        alt={`Brújula ${item.level}`}
                        className="mx-auto h-32 w-32 object-contain"
                      />

                      <p className="mt-3 font-bold">Brújula {item.level}</p>
                      <p className="text-sm text-slate-500">
                        {formatDate(item.obtainedDate)}
                      </p>

                      <button
                        onClick={() => removeProgress(item.id)}
                        className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold">📖 Bitácoras obtenidas</h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {logbookProgress.length === 0 && (
                    <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-500">
                      No hay bitácoras registradas.
                    </p>
                  )}

                  {logbookProgress.map((item: any) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 p-5 text-center"
                    >
                      <img
                        src={`/bitacoras/bitacora-${item.level}.png`}
                        alt={`Bitácora ${item.level}`}
                        className="mx-auto h-32 w-32 object-contain"
                      />

                      <p className="mt-3 font-bold">Bitácora {item.level}</p>
                      <p className="text-sm text-slate-500">
                        {formatDate(item.obtainedDate)}
                      </p>

                      <button
                        onClick={() => removeProgress(item.id)}
                        className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-bold">🏅 Especialidades</h2>
            <p className="mt-1 text-sm text-slate-500">
              Registra las especialidades obtenidas por el scout.
            </p>

            <form
              onSubmit={addSpecialty}
              className="mt-6 grid gap-4 rounded-2xl border border-slate-200 p-5 md:grid-cols-3"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Especialidad
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                >
                  <option value="">Seleccionar</option>

                  {specialties.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Fecha obtenida
                </label>
                <input
                  type="date"
                  value={specialtyDate}
                  onChange={(e) => setSpecialtyDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
                >
                  Agregar
                </button>
              </div>
            </form>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {user.specialties?.length === 0 && (
                <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-500">
                  No hay especialidades registradas.
                </p>
              )}

              {user.specialties?.map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 p-5 text-center"
                >
                  <img
                    src={`/especialidades/${item.specialty.imageKey}.png`}
                    alt={item.specialty.name}
                    className="mx-auto h-28 w-28 object-contain"
                  />

                  <p className="mt-3 font-bold">{item.specialty.name}</p>
                  <p className="text-sm text-slate-500">
                    {formatDate(item.obtainedDate)}
                  </p>

                  <button
                    onClick={() => removeSpecialty(item.id)}
                    className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-bold">📜 Historial Scout</h2>
            <p className="mt-1 text-sm text-slate-500">
                Línea de tiempo automática del progreso del scout.
            </p>

            <div className="mt-6 space-y-4">
                {scoutHistory.length === 0 && (
                <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-500">
                    No hay historial registrado todavía.
                </p>
                )}

                {scoutHistory.map((item: any) => (
                <div
                    key={`${item.icon}-${item.id}`}
                    className="flex gap-4 rounded-2xl border border-slate-200 p-4"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xl">
                    {item.icon}
                    </div>

                    <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-slate-500">{formatDate(item.date)}</p>
                    </div>
                </div>
                ))}
            </div>
            </div>
        </section>
      </div>
    </main>
  );
}