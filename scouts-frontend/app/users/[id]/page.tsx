"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import AppHeader from "../../components/AppHeader";
import { api } from "../../lib/api";
import { toast } from "sonner";

export default function UserProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [user, setUser] = useState<any>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editIdentityNumber, setEditIdentityNumber] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editGender, setEditGender] = useState("MALE");
  const [editReligion, setEditReligion] = useState("");
  const [editNationality, setEditNationality] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editJoinDate, setEditJoinDate] = useState("");
  const [editRole, setEditRole] = useState("scout");

  const [isInvested, setIsInvested] = useState(false);
  const [promiseDate, setPromiseDate] = useState("");


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

  const getRoleName = (role?: string) => {
    switch (role) {
      case "guide":
        return "Guía";
      case "subguide":
        return "Subguía";
      default:
        return "Protagonista";
    }
  };


  const openEditModal = () => {
      if (!user) return;

      setEditName(user.name || "");
      setEditPhone(user.phone || "");
      setEditRole(user.role || "scout");
      setEditIdentityNumber(user.identityNumber || "");
      setEditBirthDate(
        user.birthDate ? new Date(user.birthDate).toISOString().split("T")[0] : ""
      );
      setEditGender(user.gender || "MALE");
      setEditReligion(user.religion || "");
      setEditNationality(user.nationality || "");
      setEditAddress(user.address || "");
      setEditJoinDate(
        user.joinDate ? new Date(user.joinDate).toISOString().split("T")[0] : ""
      );

      setIsEditModalOpen(true);
    };

    const updateUserInfo = async (e: React.FormEvent) => {
      e.preventDefault();
      try{

        await api(`/users/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: editName,
            phone: editPhone,
            role: editRole,
            identityNumber: editIdentityNumber,
            birthDate: editBirthDate || null,
            gender: editGender,
            religion: editReligion,
            nationality: editNationality,
            address: editAddress,
            joinDate: editJoinDate || null,
            patrolId: selectedPatrolId || null,
          }),
        });
        toast.success("⚜️ Protagonista actualizado correctamente");


      setIsEditModalOpen(false);
      loadUser();
      } catch (error: any) {
        toast.error(error.message || "No fue posible actualizar el protagonista.");
      }
    };

  const deleteUser = async () => {
      const confirmed = window.confirm(
        "¿Seguro que querés borrar este protagonista? Esto eliminará su ficha médica, progresión, especialidades y asistencia."
      );

      if (!confirmed) return;

      await api(`/users/${id}`, {
        method: "DELETE",
      });

      window.location.href = "/";
    };

  const loadUser = async () => {
  const data = await api(`/users/${id}`);

  setUser(data);
  setInactiveReason(data.inactiveReason || "");
  setSelectedPatrolId(data.patrolId || "");
  setIsInvested(data.isInvested || false);
  setPromiseDate(
    data.promiseDate
      ? new Date(data.promiseDate).toISOString().split("T")[0]
      : ""
  );
};

  const loadPatrols = async () => {
    const res = await api("/patrols");
    setPatrols(Array.isArray(res) ? res : []);
  };

  const loadSpecialties = async () => {
    const res = await api("/specialties");
    setSpecialties(Array.isArray(res) ? res : []);
  };

  useEffect(() => {
    loadUser();
    loadSpecialties();
    loadPatrols();
  }, [id, API_URL]);

  const updatePatrol = async () => {
    if (!selectedPatrolId) return;

    await api("/users/assign-patrol", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: id,
        patrolId: selectedPatrolId,
      }),
    });

    loadUser();
  };

  const addProgress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!progressDate) return;

    await api(`/users/${id}/progress-history`, {
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
    await api(`/users/progress-history/${progressId}`, {
      method: "DELETE",
    });

    loadUser();
  };

  const addSpecialty = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSpecialty || !specialtyDate) return;

    await api("/specialties/assign", {
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
    await api(`/specialties/user-specialty/${userSpecialtyId}`, {
      method: "DELETE",
    });

    loadUser();
  };
  const downloadHistoryPdf = () => {
    toast.info("📄 Generando historial PDF...");

    window.open(`${API_URL}/users/${id}/history-pdf`, "_blank");
  };

  const updateUserStatus = async (isActive: boolean) => {
    await api(`/users/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isActive,
        inactiveReason: isActive ? undefined : inactiveReason,
      }),
    });

    loadUser();
  };

  const saveCeremonyData = async () => {
    await api(`/users/${id}/ceremony`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isInvested,
        promiseDate: promiseDate || null,
      }),
    });

    loadUser();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (today.getDate() < birth.getDate()) {
      months--;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} años y ${months} meses`;
  };

  const getCompassName = (level: number) => {
    const names: Record<number, string> = {
      1: "Bronce",
      2: "Plata",
      3: "Oro",
      4: "Platino",
    };

    return names[level] || `Brújula ${level}`;
  };

  const getLogbookName = (level: number) => {
    const names: Record<number, string> = {
      1: "Aventurero",
      2: "Intrépido",
      3: "Pionero",
      4: "Explorador",
    };

    return names[level] || `Bitácora ${level}`;
  };
  const getGenderName = (gender?: string) => {
    switch (gender) {
      case "MALE":
        return "Masculino";
      case "FEMALE":
        return "Femenino";
      case "OTHER":
        return "Otro";
      default:
        return "-";
    }
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
          ? `Obtuvo Brújula ${getCompassName(item.level)}`
          : `Obtuvo Bitácora ${getLogbookName(item.level)}`,
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

  return (
    <>
    <AppHeader />
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

          <button
            onClick={downloadHistoryPdf}
            className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            📄 Descargar PDF
          </button>
          <button
            onClick={openEditModal}
            className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            ✏️ Editar datos
          </button>
        </div>

        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">👤 {user.name}</h1>

          <div className="mt-4 rounded-2xl border border-slate-200 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Estado del scout</p>

                <p
                  className={`mt-1 text-lg font-bold ${
                    user.isActive === false
                      ? "text-red-700"
                      : "text-emerald-700"
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
              <p className="text-sm text-slate-500">Teléfono</p>
              <p className="font-semibold">{user.phone || "-"}</p>
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
              <p className="text-sm text-slate-500">Edad</p>
              <p className="font-semibold">
                {user.birthDate ? calculateAge(user.birthDate) : "-"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Género</p>
              <p className="font-semibold">{getGenderName(user.gender)}</p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Nacionalidad</p>
              <p className="font-semibold">{user.nationality || "-"}</p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Religión</p>
              <p className="font-semibold">{user.religion || "-"}</p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Fecha ingreso</p>
              <p className="font-semibold">
                {user.joinDate ? formatDate(user.joinDate) : "-"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Dirección</p>
              <p className="font-semibold">{user.address || "-"}</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Cargo</p>
              <p className="font-semibold">{getRoleName(user.role)}</p>
            </div>


            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Investidura</p>

              <div className="mt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isInvested}
                  onChange={async (e) => {
                    const checked = e.target.checked;
                    setIsInvested(checked);

                    await api(`/users/${id}/ceremony`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        isInvested: checked,
                        promiseDate: checked ? promiseDate || null : null,
                      }),
                    });

                    loadUser();
                  }}
                  className="h-5 w-5"
                />

                <span className="font-semibold">
                  {isInvested ? "Investido" : "Pendiente"}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Promesa Scout</p>

              {isInvested ? (
                <input
                  type="date"
                  value={promiseDate}
                  onChange={(e) => setPromiseDate(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Requiere investidura
                </p>
              )}
            </div>
            <button
              onClick={saveCeremonyData}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Guardar promesa
            </button>
            <button
              onClick={deleteUser}
              className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            >
              🗑️ Borrar protagonista
            </button>

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
                  onChange={(e) => {
                    setProgressType(e.target.value as "COMPASS" | "LOGBOOK");
                    setProgressLevel("1");
                  }}
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
                  {[1, 2, 3, 4].map((level) => (
                    <option key={level} value={level}>
                      {progressType === "COMPASS"
                        ? getCompassName(level)
                        : getLogbookName(level)}
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
                        alt={`Brújula ${getCompassName(item.level)}`}
                        className="mx-auto h-32 w-32 object-contain"
                      />

                      <p className="mt-3 font-bold">
                        Brújula {getCompassName(item.level)}
                      </p>
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
                        alt={`Bitácora ${getLogbookName(item.level)}`}
                        className="mx-auto h-32 w-32 object-contain"
                      />

                      <p className="mt-3 font-bold">
                        Bitácora {getLogbookName(item.level)}
                      </p>
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
                    <p className="text-sm text-slate-500">
                      {formatDate(item.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
    {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">✏️ Editar protagonista</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Actualiza la información personal del protagonista.
                </p>
              </div>

              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={updateUserInfo} className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nombre completo"
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              />

              <input
                value={editIdentityNumber}
                onChange={(e) => setEditIdentityNumber(e.target.value)}
                placeholder="Número de identificación"
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              />

              <input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Teléfono"
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              />
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              >
                <option value="scout">Protagonista</option>
                <option value="guide">Guía</option>
                <option value="subguide">Subguía</option>
              </select>

              <select
                value={editGender}
                onChange={(e) => setEditGender(e.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              >
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Femenino</option>
                <option value="OTHER">Otro</option>
              </select>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={editBirthDate}
                  onChange={(e) => setEditBirthDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Fecha de ingreso
                </label>
                <input
                  type="date"
                  value={editJoinDate}
                  onChange={(e) => setEditJoinDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
                />
              </div>

              <input
                value={editNationality}
                onChange={(e) => setEditNationality(e.target.value)}
                placeholder="Nacionalidad"
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              />

              <input
                value={editReligion}
                onChange={(e) => setEditReligion(e.target.value)}
                placeholder="Religión"
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              />

              <textarea
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Dirección"
                className="min-h-24 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 md:col-span-2"
              />

              <div className="mt-2 flex gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-full rounded-xl bg-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-300"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}