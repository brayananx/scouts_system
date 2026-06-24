"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [sections, setSections] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [patrols, setPatrols] = useState<any[]>([]);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPatrolModalOpen, setIsPatrolModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [patrolName, setPatrolName] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const loadSections = async () => {
    try {
      const res = await fetch(`${API_URL}/sections`);
      const data = await res.json();
      setSections(Array.isArray(data) ? data : []);
    } catch {
      setSections([]);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  };

  const loadPatrols = async () => {
    try {
      const res = await fetch(`${API_URL}/patrols`);
      const data = await res.json();
      setPatrols(Array.isArray(data) ? data : []);
    } catch {
      setPatrols([]);
    }
  };

  useEffect(() => {
    loadSections();
    loadUsers();
    loadPatrols();
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !identityNumber.trim()) return;

    await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        identityNumber,
        birthDate: birthDate || undefined,
        joinDate: joinDate || undefined,
        role: "scout",
      }),
    });

    setName("");
    setEmail("");
    setIdentityNumber("");
    setBirthDate("");
    setJoinDate("");
    setIsUserModalOpen(false);

    loadUsers();
    loadSections();
  };

  const createPatrol = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patrolName.trim()) return;

    await fetch(`${API_URL}/patrols`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: patrolName }),
    });

    setPatrolName("");
    setIsPatrolModalOpen(false);
    loadPatrols();
  };

  const assignPatrol = async (userId: string, patrolId: string) => {
    if (!patrolId) return;

    await fetch(`${API_URL}/users/assign-patrol`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, patrolId }),
    });

    loadUsers();
    loadPatrols();
  };

  const deletePatrol = async (id: string) => {
    const confirmDelete = confirm("¿Seguro que deseas eliminar esta patrulla?");

    if (!confirmDelete) return;

    const res = await fetch(`${API_URL}/patrols/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();

      alert(error.message || "No se pudo eliminar la patrulla.");
      return;
    }

    loadPatrols();
  };
    const filteredUsers = users.filter((u: any) => {
    const search = searchTerm.toLowerCase();
    

    return (
      u.name?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.identityNumber?.toLowerCase().includes(search) ||
      u.patrol?.name?.toLowerCase().includes(search)
    );
  });

  const activeUsers = filteredUsers.filter((u: any) => u.isActive !== false);
  const inactiveUsers = filteredUsers.filter((u: any) => u.isActive === false);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="bg-emerald-800 px-8 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">
            Sistema de registro
          </p>
          <h1 className="mt-3 text-4xl font-bold">🏕️ Tropa Coquiva 175</h1>
          <p className="mt-2 max-w-2xl text-emerald-100">
            Administración de protagonistas y patrullas del grupo.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              ➕ Crear Protagonista
            </button>

            <button
              onClick={() => setIsPatrolModalOpen(true)}
              className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
              🐺 Crear Patrulla
            </button>

            <Link
              href="/attendance"
              className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              📋 Control de Asistencia
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-8 py-8 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Protagonistas</p>
          <p className="mt-2 text-4xl font-bold">{users.length}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Patrullas</p>
          <p className="mt-2 text-4xl font-bold">{patrols.length}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-8 pb-10 lg:grid-cols-3">

        <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-xl font-bold">Protagonistas activos</h2>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo, identidad o patrulla..."
            className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
          />

          <div className="mt-6 max-h-[420px] space-y-4 overflow-y-auto pr-2">
            {activeUsers.length === 0 && (
              <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-500">
                No hay protagonistas activos.
              </p>
            )}

            {activeUsers.map((u: any) => (
              <div
                key={u.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-lg font-bold">{u.name}</p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                  <p className="text-sm text-slate-500">
                    ID: {u.identityNumber || "Sin identidad"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {u.role}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {u.patrol?.name || "Sin patrulla"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href={`/users/${u.id}`}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Ver Perfil
                  </Link>
                </div>
              </div>
            ))}
            {inactiveUsers.length > 0 && (
              <section className="mx-auto max-w-7xl px-8 pb-12">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-red-700">Protagonistas inactivos</h2>

                  <div className="mt-5 max-h-[420px] space-y-4 overflow-y-auto pr-2">
                    {inactiveUsers.map((u: any) => (
                      <div
                        key={u.id}
                        className="flex flex-col gap-4 rounded-2xl border border-red-100 bg-red-50 p-5 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="text-lg font-bold">{u.name}</p>
                          <p className="text-sm text-slate-500">{u.email}</p>
                          <p className="text-sm text-slate-500">
                            ID: {u.identityNumber || "Sin identidad"}
                          </p>

                          {u.inactiveReason && (
                            <p className="mt-2 text-sm text-red-700">
                              <strong>Razón:</strong> {u.inactiveReason}
                            </p>
                          )}
                        </div>

                        <Link
                          href={`/users/${u.id}`}
                          className="rounded-xl bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Ver Perfil
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 pb-12">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Patrullas</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {patrols.length === 0 && (
              <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-500">
                No hay patrullas creadas todavía.
              </p>
            )}

            {patrols.map((p: any) => (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {p.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Integrantes: {p.users?.length || 0}
                    </p>
                  </div>

                  <button
                    onClick={() => deletePatrol(p.id)}
                    className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>

                {p.users?.length > 0 && (
                  <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700">
                    No se puede eliminar si tiene protagonistas asignados.
                  </p>
                )}

                <div className="mt-4 space-y-2">
                  {p.users?.length ? (
                    p.users.map((u: any) => (
                      <div
                        key={u.id}
                        className="rounded-xl bg-slate-100 px-4 py-2 text-sm"
                      >
                        👤 {u.name}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No hay protagonistas asignados.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Crear protagonista</h2>

              <button
                onClick={() => setIsUserModalOpen(false)}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={createUser} className="mt-6 space-y-4">
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                placeholder="Número de identidad"
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Fecha de nacimiento
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Fecha de ingreso al grupo
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold hover:bg-slate-100"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
                >
                  Guardar usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isPatrolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Crear patrulla</h2>

              <button
                onClick={() => setIsPatrolModalOpen(false)}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Ingresa el nombre de la nueva patrulla.
            </p>

            <form onSubmit={createPatrol} className="mt-6 space-y-4">
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                placeholder="Nombre de patrulla"
                value={patrolName}
                onChange={(e) => setPatrolName(e.target.value)}
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPatrolModalOpen(false)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold hover:bg-slate-100"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  Guardar patrulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}