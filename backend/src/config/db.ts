import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  console.error("❌ Critical Error: DATABASE_URL is missing from process.env!");
}

// Aiven managed Postgres uses a self-signed Project CA. The connection URL
// carries `uselibpqcompat=true&sslmode=require` (libpq `require` semantics:
// TLS-encrypted, cert chain not pinned), which the pg driver picks up from
// the connection string. Keep any SSL tuning here in sync with the URL.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
