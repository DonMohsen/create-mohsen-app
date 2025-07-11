#!/usr/bin/env node
import { intro, text, select, outro, isCancel } from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { renderThanks, renderTitle } from "./consts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


console.clear();
// intro(chalk.bgBlue(" Create Mohsen App CLI "));
renderTitle();

// ========== COLLECT ALL USER INPUT ==========

// 1. Project name
const projectNameRaw = await text({
  message: "📦 App name:",
  placeholder: "my-app",
  validate: (value) => (!value ? "Required" : undefined),
});

if (isCancel(projectNameRaw)) {
  outro("Operation cancelled.");
  process.exit(0);
}

let targetDir: string;
let projectName: string;

if (projectNameRaw === ".") {
  const confirm = await select({
    message: "⚠️  You chose the current directory. Proceed?",
    options: [
      {
        label: "Yes, create into current directory and overwrite existing data",
        value: "yes",
      },
      { label: "No, cancel", value: "no" },
    ],
  });

  if (isCancel(confirm) || confirm === "no") {
    outro("Operation cancelled.");
    process.exit(0);
  }

  targetDir = process.cwd();
  projectName = path.basename(targetDir);
} else {
  targetDir = path.resolve(process.cwd(), projectNameRaw);
  projectName = projectNameRaw;
}

// 2. Language
const language = await select({
  message: "🧠 Language:",
  options: [
    { label: "TypeScript", value: "ts" },
    { label: "JavaScript", value: "js" },
  ],
});

if (isCancel(language)) {
  outro("Operation cancelled.");
  process.exit(0);
}

// 3. ESLint
const enableEslint = await select({
  message: "🛠️  Do you want to enable ESLint?",
  options: [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ],
});

if (isCancel(enableEslint)) {
  outro("Operation cancelled.");
  process.exit(0);
}

// ========== CHECK TARGET DIR (NO FILESYSTEM CHANGES YET) ==========
if (await fs.pathExists(targetDir)) {
  const files = await fs.readdir(targetDir);
  if (files.length > 0) {
    outro(chalk.red(`❌ The target directory "${targetDir}" is not empty.`));
    process.exit(1);
  }
}

// ========== CREATE PROJECT ONLY NOW ==========

// Create folder
await fs.mkdir(targetDir, { recursive: true });

// 📁 Copy base template
const baseTemplatePath = path.join(__dirname, "templates", "base");
await fs.copy(baseTemplatePath, targetDir);

// --- Language-specific adjustments ---
if (language === "js") {
  const jsExtrasPath = path.join(__dirname, "templates", "extra", "js");

  await fs.remove(path.join(targetDir, "tsconfig.json"));

  await fs.copy(
    path.join(jsExtrasPath, "layout.jsx"),
    path.join(targetDir, "app/layout.jsx")
  );
  await fs.copy(
    path.join(jsExtrasPath, "page.jsx"),
    path.join(targetDir, "app/page.jsx")
  );

  await Promise.all([
    fs.remove(path.join(targetDir, "app/layout.tsx")),
    fs.remove(path.join(targetDir, "app/page.tsx")),
  ]);
}

if (language === "ts") {
  const tsExtrasPath = path.join(__dirname, "templates", "extra", "ts");
  await fs.copy(tsExtrasPath, targetDir, { overwrite: true });
}

//!the actions file

const actionFileName = language === "ts" ? "getUsers.ts" : "getUsers.js";
const actionSourcePath = path.join(
  __dirname,
  "templates",
  "extra",
  "actions",
  `action-${language}`,
  actionFileName
);
const actionTargetPath = path.join(targetDir, "actions", actionFileName);

await fs.copy(actionSourcePath, actionTargetPath);


// 📝 Copy ESLint config if selected
if (enableEslint === "yes") {
  const eslintConfigPath = path.join(
    __dirname,
    "templates",
    "extra",
    "eslint",
    "eslint.config.mjs"
  );
  await fs.copy(eslintConfigPath, path.join(targetDir, "eslint.config.mjs"));
}

// 🔧 Update package.json
const pkgPath = path.join(targetDir, "package.json");
const pkg = await fs.readJSON(pkgPath);

pkg.name = projectName;
pkg.description = "";

if (language === "ts") {
  pkg.devDependencies = {
    typescript: "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
  };
  if ("type" in pkg) delete pkg.type;
} else if (language === "js") {
  if ("devDependencies" in pkg) delete pkg.devDependencies;
}

await fs.writeJSON(pkgPath, pkg, { spaces: 2 });

// ✅ Done!
// outro(
//   `✅ Project "${projectName}" created as ${
//     language === "ts" ? "TypeScript" : "JavaScript"
//   } project`
// );
renderThanks();