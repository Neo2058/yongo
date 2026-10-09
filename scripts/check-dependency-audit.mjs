import { readFileSync } from "node:fs"

// Explicit, tracked exception: no patched braces release exists, and this
// dependency is used only by ESLint. Production audit remains a separate gate.
const raw = readFileSync(0, "utf8").trim()
const findings = raw ? raw.split("\n").map((line) => JSON.parse(line)) : []
let failed = false
for (const finding of findings) {
  const report = finding.children
  const knownBuildOnly = finding.value === "braces" &&
    report?.URL === "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm" &&
    report["Tree Versions"]?.length === 1 && report["Tree Versions"][0] === "3.0.3" &&
    report.Dependents?.length === 1 && report.Dependents[0] === "micromatch@npm:4.0.8"
  if (knownBuildOnly) {
    console.warn("Tracked build-only exception: braces GHSA-vfj7-8cjw-p6xm; see docs/production-security.md. Recheck when a patched release appears.")
  } else {
    failed = true
    console.error(JSON.stringify(finding))
  }
}
if (failed) process.exitCode = 1
