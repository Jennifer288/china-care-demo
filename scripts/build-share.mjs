// Build in a disposable copy so local authenticated routes are never removed.
import {
  cp,
  mkdtemp,
  rm,
  symlink,
  readFile,
  writeFile,
} from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const stage = await mkdtemp(path.join(root, ".share-build-"));
try {
  for (const name of [
    "src",
    "package.json",
    "tsconfig.json",
    "next-env.d.ts",
    "next.config.ts",
    "postcss.config.mjs",
  ])
    await cp(path.join(root, name), path.join(stage, name), {
      recursive: true,
    });
  await symlink(
    path.join(root, "node_modules"),
    path.join(stage, "node_modules"),
    "dir",
  );
  await rm(path.join(stage, "src/app/api"), { recursive: true });
  await rm(path.join(stage, "src/app/auth"), { recursive: true });
  const route = path.join(stage, "src/app/[[...slug]]/page.tsx");
  await writeFile(
    route,
    (await readFile(route, "utf8")) +
      `
export const dynamicParams = false;
export function generateStaticParams() {
  const paths = ["", "why-china", "hospitals", "doctors", "treatments", "patient-journey", "patient-stories", "care-planning", "services", "privacy", "terms", "about", "contact", "login", "register", "forgot-password", "reset-password", "dashboard", "dashboard/cases/new", "admin"];
  for (const [prefix, items] of [["hospitals", hospitals], ["doctors", doctors], ["treatments", specialties]] as const) {
    for (const item of items) paths.push(prefix + "/" + item.id);
  }
  return paths.map(p => ({slug:p ? p.split("/") : []}));
}
`,
  );
  const env = {
    ...process.env,
    NEXT_PUBLIC_SHARE_PREVIEW: "true",
    NEXT_PUBLIC_BASE_PATH:
      process.env.NEXT_PUBLIC_BASE_PATH || "/china-care-demo",
  };
  // The exported site never receives backend configuration or local secrets.
  delete env.NEXT_PUBLIC_SUPABASE_URL;
  delete env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete env.APP_URL;
  const result = spawnSync(
    process.execPath,
    [path.join(root, "node_modules/next/dist/bin/next"), "build", "--webpack"],
    { cwd: stage, env, stdio: "inherit" },
  );
  if (result.status !== 0) throw new Error("Share build failed");
  await rm(path.join(root, "out"), { recursive: true, force: true });
  await cp(path.join(stage, "out"), path.join(root, "out"), {
    recursive: true,
  });
  await writeFile(path.join(root, "out/.nojekyll"), "");
  console.log("Public reference site exported to out/");
} finally {
  await rm(stage, { recursive: true, force: true });
}
