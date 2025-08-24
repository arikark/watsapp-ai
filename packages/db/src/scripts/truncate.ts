import dotenv from 'dotenv';

// import { getDb } from "./client";
// import * as schema from "./schema";
// Load environment variables
dotenv.config();

// Sample data to seed the database

// This script will seed the database with initial data
async function main() {
  console.log('Truncating database...');

  console.log('Database truncated successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Truncating failed!');
  console.error(err);
  process.exit(1);
});
