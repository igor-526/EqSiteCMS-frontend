import { randomUUID } from "node:crypto";
import { runIsolatedTypecheck } from "./typecheck-lib.mjs";

await runIsolatedTypecheck({ runId: `${process.pid}-${randomUUID()}` });
