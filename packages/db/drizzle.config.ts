import type { Config } from "drizzle-kit";
import { z } from "zod";

const envSchema = z.object({
	DB_POSTGRES_URL: z.string()
});

const env = envSchema.parse(process.env);


export default {
	schema: "./src/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	migrations: {
		schema: "public",
		table: "migrations",
	},
	dbCredentials: {
		url: env.DB_POSTGRES_URL,
	},
} satisfies Config;
