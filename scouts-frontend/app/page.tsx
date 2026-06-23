"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [sections, setSections] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const loadSections = async () => {
    try {
      const res = await fetch(`${API_URL}/sections`);
      const data = await res.json();

      console.log("SECTIONS:", data);

      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando secciones:", error);
      setSections([]);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();

      console.log("USERS:", data);

      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    loadSections();
    loadUsers();
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          role: "scout",
        }),
      });

      setName("");
      setEmail("");

      loadUsers();
      loadSections();
    } catch (error) {
      console.error("Error creando usuario:", error);
    }
  };

  const getSectionName = (sectionId: string) => {
    const section = sections.find((s: any) => s.id === sectionId);
    return section ? section.name : "Sin tropa";
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>🏕️ Sistema Scouts</h1>

      <form onSubmit={createUser}>
        <h2>Crear usuario</h2>

        <input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Crear</button>
      </form>

      <h2>Usuarios</h2>

      {Array.isArray(users) &&
        users.map((u: any) => (
          <div key={u.id} style={{ marginBottom: 10 }}>
            👤 {u.name} ({u.email}) - {u.role}

            <select
              style={{ marginLeft: 10 }}
              onChange={async (e) => {
                const sectionId = e.target.value;

                if (!sectionId) return;

                try {
                  await fetch(
                    `${API_URL}/users/assign-section`,
                    {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        userId: u.id,
                        sectionId,
                      }),
                    }
                  );

                  alert("Usuario asignado!");

                  loadSections();
                  loadUsers();
                } catch (error) {
                  console.error(error);
                }
              }}
            >
              <option value="">Asignar tropa</option>

              {Array.isArray(sections) &&
                sections.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>
        ))}

      <h2>Tropas</h2>

      {Array.isArray(sections) &&
        sections.map((s: any) => (
          <div key={s.id}>
            <h3>🏕️ {s.name}</h3>

            {Array.isArray(s.users) &&
              s.users.map((u: any) => (
                <div key={u.id}>👤 {u.name}</div>
              ))}
          </div>
        ))}
    </main>
  );
}