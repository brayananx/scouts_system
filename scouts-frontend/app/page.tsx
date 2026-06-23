"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [sections, setSections] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const loadSections = async () => {
    const res = await fetch("http://localhost:3000/sections");
    const data = await res.json();
    setSections(data);
  };

  const loadUsers = async () => {
    const res = await fetch("http://localhost:3000/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    loadSections();
    loadUsers();
  }, []);

  const createUser = async (e: any) => {
    e.preventDefault();

    await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role: "scout" }),
    });

    setName("");
    setEmail("");

    loadUsers();
    loadSections();
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
      {users.map((u: any) => (
  <div key={u.id} style={{ marginBottom: 10 }}>
    👤 {u.name} ({u.email}) - {u.role}

    <select
      style={{ marginLeft: 10 }}
      onChange={async (e) => {
        const sectionId = e.target.value;

        if (!sectionId) return;

        await fetch("http://localhost:3000/users/assign-section", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: u.id,
            sectionId,
          }),
        });

        alert("Usuario asignado!");

        loadSections();
        loadUsers();
      }}
    >
      <option value="">Asignar tropa</option>

      {sections.map((s: any) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  </div>
))}

      <h2>Tropas</h2>
      {sections.map((s: any) => (
        <div key={s.id}>
          <h3>🏕️ {s.name}</h3>

          {s.users?.map((u: any) => (
            <div key={u.id}>👤 {u.name}</div>
          ))}
        </div>
      ))}
    </main>
  );
}