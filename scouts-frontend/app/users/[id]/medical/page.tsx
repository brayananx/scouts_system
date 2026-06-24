"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

export default function MedicalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [notes, setNotes] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const loadMedicalRecord = async () => {
    const res = await fetch(`${API_URL}/medical-records/${id}`);
    const data = await res.json();

    if (!data) return;

    setBloodType(data.bloodType || "");
    setAllergies(data.allergies || "");
    setMedications(data.medications || "");
    setMedicalConditions(data.medicalConditions || "");
    setEmergencyContact(data.emergencyContact || "");
    setEmergencyPhone(data.emergencyPhone || "");
    setGuardianName(data.guardianName || "");
    setNotes(data.notes || "");
  };

  useEffect(() => {
    loadMedicalRecord();
  }, [id, API_URL]);

  const saveMedicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch(`${API_URL}/medical-records/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bloodType,
        allergies,
        medications,
        medicalConditions,
        emergencyContact,
        emergencyPhone,
        guardianName,
        notes,
      }),
    });

    setSavedMessage("Ficha médica guardada correctamente");
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/users/${id}`}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          ← Volver al perfil
        </Link>

        <section className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">🩺 Ficha Médica</h1>
          <p className="mt-2 text-sm text-slate-500">
            Información médica importante para actividades, campamentos y salidas.
          </p>

          {(allergies || medicalConditions || medications) && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
              <h2 className="text-lg font-bold text-red-700">
                ⚠️ Alerta médica
              </h2>

              {allergies && (
                <p className="mt-2 text-sm text-red-800">
                  <strong>Alergias:</strong> {allergies}
                </p>
              )}

              {medicalConditions && (
                <p className="mt-2 text-sm text-red-800">
                  <strong>Condiciones:</strong> {medicalConditions}
                </p>
              )}

              {medications && (
                <p className="mt-2 text-sm text-red-800">
                  <strong>Medicamentos:</strong> {medications}
                </p>
              )}
            </div>
          )}

          <form
            onSubmit={saveMedicalRecord}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Tipo de sangre
              </label>
              <input
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                placeholder="Ej: O+"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Nombre del encargado
              </label>
              <input
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Nombre del encargado"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Contacto de emergencia
              </label>
              <input
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Nombre del contacto"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Teléfono de emergencia
              </label>
              <input
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="Ej: 8888-8888"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Alergias
              </label>
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Ej: Penicilina, maní, picaduras..."
                className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Medicamentos actuales
              </label>
              <textarea
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="Medicamentos que toma actualmente"
                className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Condiciones médicas
              </label>
              <textarea
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="Ej: Asma, diabetes, epilepsia..."
                className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Observaciones
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cualquier detalle adicional importante"
                className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
              />
            </div>

            {savedMessage && (
              <p className="rounded-xl bg-emerald-100 p-3 text-sm font-semibold text-emerald-700 md:col-span-2">
                {savedMessage}
              </p>
            )}

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
              >
                Guardar ficha médica
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}