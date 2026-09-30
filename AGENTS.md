<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Prisma engine workaround (2026-09-30)
`npx prisma` CLI commands that need native engines (migrate/generate/db) fail with
ECONNRESET when the CLI tries to auto-download. Fix: engines were placed manually at
`node_modules/@prisma/engines/schema-engine-debian-openssl-3.0.x` and
`node_modules/@prisma/engines/libquery_engine-debian-openssl-3.0.x.so.node`
(downloaded from binaries.prisma.sh/all_commits/<enginesVersion>/debian-openssl-3.0.x/,
enginesVersion from `node -e "console.log(require('./node_modules/@prisma/engines/dist/index.js').enginesVersion)"`).
Prefix CLI calls with:
PRISMA_SCHEMA_ENGINE_BINARY=$PWD/node_modules/@prisma/engines/schema-engine-debian-openssl-3.0.x
PRISMA_QUERY_ENGINE_LIBRARY=$PWD/node_modules/@prisma/engines/libquery_engine-debian-openssl-3.0.x.so.node
Note: this Prisma version looks for engines in node_modules/@prisma/engines/ (not
node_modules/@prisma/ directly). node_modules is gitignored, so Vercel builds fetch
their own engines normally.
