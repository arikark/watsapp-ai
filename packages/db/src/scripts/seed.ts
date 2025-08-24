import dotenv from 'dotenv';

// import { getDb } from "./client";
// import * as schema from "./schema";
// Load environment variables
dotenv.config();

// Sample data to seed the database

// This script will seed the database with initial data
async function main() {
  console.log('Seeding database...');

  // const db = getDb(process.env.DATABASE_URL!);

  console.log('Database seeded successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed!');
  console.error(err);
  process.exit(1);
});
