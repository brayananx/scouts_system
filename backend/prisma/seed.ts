import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

function formatName(imageKey: string) {
  return imageKey
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function main() {
  const specialtiesPath = path.join(
    __dirname,
    "../../scouts-frontend/public/especialidades"
  );

  const files = fs
    .readdirSync(specialtiesPath)
    .filter((file) => file.endsWith(".png"));

  for (const file of files) {
    const imageKey = file.replace(".png", "");
    const name = formatName(imageKey);

    await prisma.specialty.upsert({
      where: { imageKey },
      update: { name },
      create: {
        name,
        imageKey,
      },
    });
  }

  console.log(`✅ ${files.length} especialidades cargadas correctamente`);

  const password = await bcrypt.hash("coquiva175", 10);

  await prisma.systemUser.upsert({
    where: { username: "admin" },
    update: {
      password,
    },
    create: {
      name: "Administrador",
      username: "admin",
      password,
      role: "ADMIN",
    },
  });

  console.log("✅ Usuario administrador creado");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });