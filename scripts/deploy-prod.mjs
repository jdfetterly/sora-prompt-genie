#!/usr/bin/env node
/**
 * Ensures every production deploy follows the exact same series of commands.
 * - Runs predeploy checks (typecheck, lint, tests)
 * - Builds Vercel output targeting prod
 * - Deploys the prebuilt artifact to production
 * - Prompts the operator with post-deploy manual verification steps
 */

import { spawn } from "node:child_process";

const steps = [
  {
    label: "Predeploy checks (typecheck + lint + tests)",
    command: "npm",
    args: ["run", "predeploy"],
  },
  {
    label: "Generate production build output",
    command: "npx",
    args: ["vercel", "build", "--prod", "--yes"],
  },
  {
    label: "Deploy prebuilt artifact to production",
    command: "npx",
    args: ["vercel", "deploy", "--prebuilt", "--prod", "--yes"],
  },
];

function runStep({ label, command, args }) {
  console.log(`\n➡️  ${label}`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("exit", (code) => {
      if (code === 0) {
        console.log(`✅ Completed: ${label}`);
        resolve();
      } else {
        reject(new Error(`Command "${command} ${args.join(" ")}" failed with exit code ${code}`));
      }
    });
    child.on("error", reject);
  });
}

(async () => {
  try {
    for (const step of steps) {
      await runStep(step);
    }

    console.log("\n🎉 Production deployment completed.");
    console.log("Next manual verification steps (do these before announcing the release):");
    [
      "Visit the new production URL printed above and load the SPA home page.",
      "Exercise key flows (prompt generation, API calls) to confirm there are no runtime errors.",
      "Open Vercel → Deployments → Latest → Functions → Logs and scan for warnings/errors.",
      "Notify the team that production is updated once the smoke test passes.",
    ].forEach((item, idx) => console.log(`  ${idx + 1}. ${item}`));
  } catch (error) {
    console.error(`\n❌ Deployment aborted: ${error.message}`);
    console.error("Fix the issue above and rerun `npm run deploy:prod`.");
    process.exit(1);
  }
})();
