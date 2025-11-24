// Ambient module declarations to avoid build-time type errors when optional
// native modules (like @prisma/client or firebase) are not installed yet.
// This keeps the dev experience smooth without requiring an immediate terminal step.

declare module '@prisma/client' {
  // Minimal PrismaClient stub to satisfy TypeScript during development when the
  // generated client isn't present. Runtime code should guard against missing
  // Prisma client (we already use a runtime require fallback in `lib/prisma.ts`).
  export class PrismaClient {
    constructor(...args: any[]);
    $disconnect(): Promise<void>;
    [key: string]: any;
  }
  export * from '@prisma/client/runtime';
}

// Let the installed `firebase` package provide its own types.
// Removed manual ambient declarations so TypeScript can pick up the
// official `firebase` types from `node_modules` when present.

// Allow importing the client map file without types
declare module '@prisma/client/runtime' { const anything: any; export default anything; }
