import { registerHooks } from "node:module"
import { readFileSync } from "node:fs"
import path from "node:path"
import { pathToFileURL, fileURLToPath } from "node:url"
import ts from "typescript"

export const root = fileURLToPath(new URL("../", import.meta.url))
export const hooks = registerHooks({
  resolve(specifier, ctx, next) {
    if (specifier === "server-only") return { url: "yongo-test:server-only", shortCircuit: true }
    if (specifier === "next/headers") return { url: new URL("./request-context.mjs", import.meta.url).href, shortCircuit: true }
    if (specifier === "next/server") return next("next/server.js", ctx)
    if (specifier.startsWith("@/")) {
      return { url: pathToFileURL(path.join(root, "src", `${specifier.slice(2)}.ts`)).href, shortCircuit: true }
    }
    return next(specifier, ctx)
  },
  load(url, ctx, next) {
    if (url === "yongo-test:server-only") return { format: "module", source: "export {}", shortCircuit: true }
    if (url.startsWith("file:") && url.endsWith(".ts")) {
      const source = ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      }).outputText
      return { format: "module", source, shortCircuit: true }
    }
    return next(url, ctx)
  },
})
