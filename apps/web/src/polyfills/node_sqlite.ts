// Polyfill for node:sqlite in Cloudflare Workers environment
// This prevents the import error when better-auth tries to import node:sqlite

export const DatabaseSync = {
  // Mock implementation - this should not be used in Cloudflare Workers
  // as we're using the drizzle adapter with PostgreSQL
};

export default {
  DatabaseSync,
};
