"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error de autenticación");
        return;
      }

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/");
    } catch {
      setError("No fue posible conectar con el servidor");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        <div className="hidden bg-emerald-800 p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl">
              ⚜️
            </div>

            <h1 className="mt-6 text-4xl font-bold">Tropa Coquiva 175</h1>

            <p className="mt-3 text-emerald-100">
              Sistema de gestión para scouts, patrullas, asistencia y progresión.
            </p>
          </div>

          <p className="text-sm text-emerald-200">
            Grupo 175 · Guías y Scouts de Costa Rica
          </p>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
              Bienvenido
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Iniciar sesión
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Nombre de usuario
              </label>

              <input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Contraseña
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-600"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}