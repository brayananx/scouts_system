"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppHeader from "./components/AppHeader";
import { api } from "./lib/api";
import { toast } from "sonner";

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  const [sections, setSections] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [patrols, setPatrols] = useState<any[]>([]);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPatrolModalOpen, setIsPatrolModalOpen] = useState(false);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);

  const [isEditPatrolOpen, setIsEditPatrolOpen] = useState(false);
  const [editPatrolName, setEditPatrolName] = useState("");
  const [selectedPatrol, setSelectedPatrol] = useState<any>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("MALE");
  const [religion, setReligion] = useState("");
  const [nationality, setNationality] = useState("");
  const [address, setAddress] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [patrolName, setPatrolName] = useState("");
  const getRoleName = (role?: string) => {
    if (role === "guide") return "Guía";
    if (role === "subguide") return "Subguía";
    return "";
  };
  const [searchTerm, setSearchTerm] = useState("");

  const loadSections = async () => {
  try {
    const data = await api("/sections");
    setSections(Array.isArray(data) ? data : []);
  } catch {
    setSections([]);
  }
};

  const openEditPatrol = (patrol: any) => {
    setSelectedPatrol(patrol);
    setEditPatrolName(patrol.name);
    setIsEditPatrolOpen(true);
  };

const loadUsers = async () => {
  try {
    const data = await api("/users");
    setUsers(Array.isArray(data) ? data : []);
  } catch {
    setUsers([]);
  }
};

const loadPatrols = async () => {
  try {
    const data = await api("/patrols");
    setPatrols(Array.isArray(data) ? data : []);
  } catch {
    setPatrols([]);
  }
};

  useEffect(() => {
    const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }
    loadSections();
    loadUsers();
    loadPatrols();
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !identityNumber.trim()) return;

    try {

      await api("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          gender,
          religion,
          nationality,
          address,
          identityNumber,
          birthDate: birthDate || undefined,
          joinDate: joinDate || undefined,
          role: "scout",
        }),
    });

    toast.success("⚜️ Protagonista registrado correctamente");

    setName("");
    setPhone("");
    setGender("MALE");
    setReligion("");
    setNationality("");
    setAddress("");
    setIdentityNumber("");
    setBirthDate("");
    setJoinDate("");
    setIsUserModalOpen(false);

    loadUsers();
    loadSections();
  } catch (error: any) {
    toast.error(error.message || "No fue posible registrar el protagonista.");
  }
};

  const createPatrol = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patrolName.trim()) return;

    await api("/patrols", {
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

    await api("/users/assign-patrol", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, patrolId }),
    });

    loadUsers();
    loadPatrols();
  };

  const deletePatrol = async (patrolId: string) => {
      const confirmed = window.confirm(
        "¿Seguro que querés eliminar esta patrulla?"
      );

      if (!confirmed) return;

      try {
        await api(`/patrols/${patrolId}`, {
          method: "DELETE",
        });

        toast.success("🐺 Patrulla eliminada correctamente");
        loadPatrols();
      } catch (error: any) {
        toast.error(error.message || "No se pudo eliminar la patrulla.");
      }
    };
    const filteredUsers = users.filter((u: any) => {
  const search = searchTerm.toLowerCase();

  return (
    u.name?.toLowerCase().includes(search) ||
    u.phone?.toLowerCase().includes(search) ||
    u.identityNumber?.toLowerCase().includes(search) ||
    u.patrol?.name?.toLowerCase().includes(search)
  );
});

  const activeUsers = filteredUsers.filter((u: any) => u.isActive !== false);
  const inactiveUsers = filteredUsers.filter((u: any) => u.isActive === false);

  const getAgeYears = (birthDate: string) => {
  const birth = new Date(birthDate);
  const today = new Date();

  let years = today.getFullYear() - birth.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());

  if (!hasHadBirthdayThisYear) {
    years--;
  }

  return years;
};

const getRequiredLogbookByAge = (age: number) => {
  if (age >= 14) return { level: 4, name: "Explorador" };
  if (age >= 13) return { level: 3, name: "Pionero" };
  if (age >= 12) return { level: 2, name: "Intrépido" };
  if (age >= 11) return { level: 1, name: "Aventurero" };

  return null;
};

const reminders = activeUsers
  .map((user: any) => {
    // PRIORIDAD 1: Investidura
    if (!user.isInvested) {
      return {
        id: user.id,
        name: user.name,
        type: "INVESTITURE",
        message: "Pendiente investidura",
      };
    }

    // PRIORIDAD 2: Promesa
    if (!user.promiseDate) {
      return {
        id: user.id,
        name: user.name,
        type: "PROMISE",
        message: "Pendiente promesa scout",
      };
    }

    // PRIORIDAD 3: Bitácoras
    if (!user.birthDate) return null;

    const age = getAgeYears(user.birthDate);
    const requiredLogbook = getRequiredLogbookByAge(age);

    if (!requiredLogbook) return null;

    const hasRequiredLogbook = user.progress?.some(
      (item: any) =>
        item.type === "LOGBOOK" &&
        item.level === requiredLogbook.level
    );

    if (hasRequiredLogbook) return null;

    return {
      id: user.id,
      name: user.name,
      type: "LOGBOOK",
      message: `Pendiente Bitácora ${requiredLogbook.name}`,
    };
  })
  .filter(Boolean);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
        <>
        <AppHeader
          onCreateUser={() => setIsUserModalOpen(true)}
          onCreatePatrol={() => setIsPatrolModalOpen(true)}
        />
      
        
      <section className="mx-auto grid max-w-7xl gap-6 px-8 py-8 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Protagonistas</p>
          <p className="mt-2 text-4xl font-bold">{users.length}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Patrullas</p>
          <p className="mt-2 text-4xl font-bold">{patrols.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Recordatorios</p>
          <p className="mt-2 text-4xl font-bold text-amber-600">
            {reminders.length}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-8 pb-10 lg:grid-cols-3">

        <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
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

                  <p className="text-sm text-slate-500">
                    📞 {u.phone || "Sin teléfono"}
                  </p>

                  <p className="text-sm text-slate-500">
                    🪪 {u.identityNumber || "Sin identificación"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {u.role !== "scout" && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {getRoleName(u.role)}
                      </span>
                    )}

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {u.patrol?.name || "Sin patrulla"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        u.isActive === false
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {u.isActive === false ? "Inactivo" : "Activo"}
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

                          <p className="text-sm text-slate-500">
                            📞 {u.phone || "Sin teléfono"}
                          </p>

                          <p className="text-sm text-slate-500">
                            🪪 {u.identityNumber || "Sin identificación"}
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
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">🔔 Recordatorios</h2>
          <p className="mt-1 text-sm text-slate-500">
            Bitácoras pendientes según edad.
          </p>

          <div className="mt-5 max-h-[520px] space-y-3 overflow-y-auto pr-2">
            {reminders.length === 0 && (
              <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-500">
                No hay recordatorios pendientes.
              </p>
            )}

            {reminders.map((reminder: any) => (
              <Link
                key={reminder.id}
                href={`/users/${reminder.id}`}
                className="block rounded-xl border border-amber-200 bg-amber-50 p-4 hover:bg-amber-100"
              >
                <p className="font-bold text-slate-900">{reminder.name}</p>
                <p className="mt-1 text-sm text-amber-800">
                  {reminder.message}
                </p>
              </Link>
            ))}
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditPatrol(p)}
                      className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      ✏️ Editar
                    </button>

                    <button
                      onClick={() => deletePatrol(p.id)}
                      className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
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
                placeholder="Número de identidad"
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
              />

              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                placeholder="Número de teléfono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              >
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Femenino</option>
                <option value="OTHER">Otro</option>
              </select>

              <input
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="Nacionalidad"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              />

              <input
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                placeholder="Religión"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              />

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dirección"
                className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
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
      {isEditPatrolOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Editar patrulla</h2>

              <button
                onClick={() => setIsEditPatrolOpen(false)}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();

                if (!editPatrolName.trim() || !selectedPatrol) return;

                try {
                  await api(`/patrols/${selectedPatrol.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ name: editPatrolName }),
                  });

                  toast.success("🐺 Patrulla actualizada correctamente");
                  setIsEditPatrolOpen(false);
                  setSelectedPatrol(null);
                  setEditPatrolName("");
                  loadPatrols();
                } catch (error: any) {
                  toast.error(error.message || "No se pudo actualizar la patrulla.");
                }
              }}
              className="mt-6 space-y-4"
            >
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                placeholder="Nombre de patrulla"
                value={editPatrolName}
                onChange={(e) => setEditPatrolName(e.target.value)}
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditPatrolOpen(false)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold hover:bg-slate-100"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
    </main>
  );
}