#!/usr/bin/env node
import { text, select, outro, isCancel, confirm } from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { renderThanks, renderTitle } from "./consts.js";
import { spawn } from "node:child_process";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.clear();
renderTitle();
// ========== COLLECT ALL USER INPUT FIRST ==========
// 1. Project name
const projectNameRaw = await text({
    message: "App name:",
    placeholder: "my-mohsen-app",
    validate: (value) => (!value ? "Required" : undefined),
});
if (isCancel(projectNameRaw)) {
    outro("Operation cancelled.");
    process.exit(0);
}
let targetDir;
let projectName;
if (projectNameRaw === ".") {
    const confirm = await select({
        message: "You chose the current directory. Proceed?",
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
}
else {
    targetDir = path.resolve(process.cwd(), projectNameRaw);
    projectName = projectNameRaw;
}
// 2. Language
const language = await select({
    message: "Language:",
    options: [
        { label: "TypeScript", value: "ts" },
        { label: "JavaScript", value: "js" },
    ],
});
if (isCancel(language)) {
    outro("Operation cancelled.");
    process.exit(0);
}
// 3. Styling
const styling = await select({
    message: "Styling:",
    options: [
        { label: "TailwindCSS", value: "tw" },
        { label: "CSS", value: "css" },
    ],
});
if (isCancel(styling)) {
    outro("Operation cancelled.");
    process.exit(0);
}
// 4.api routes
const apiRouteUse = await confirm({
    message: "Use api routes?",
});
// 5.zustand
const zustandUse = await select({
    message: "Use Zustand?:",
    options: [
        { label: "Yes", value: "withZustand" },
        { label: "No", value: "withoutZustand" },
    ],
});
if (isCancel(zustandUse)) {
    outro("Operation cancelled.");
    process.exit(0);
}
// 5. ESLint
const enableEslint = await select({
    message: "Enable ESLint?",
    options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
    ],
});
if (isCancel(enableEslint)) {
    outro("Operation cancelled.");
    process.exit(0);
}
// 6. Turbopack
const useTurbopack = await select({
    message: "Use Turbopack?",
    options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
    ],
});
if (isCancel(useTurbopack)) {
    outro("Operation cancelled.");
    process.exit(0);
}
// ========== CHECK TARGET DIR BEFORE DOING FS CHANGES ==========
if (await fs.pathExists(targetDir)) {
    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
        outro(chalk.red(`❌ The target directory "${targetDir}" is not empty.`));
        process.exit(1);
    }
}
// ========== NOW PERFORM FILESYSTEM OPERATIONS ==========
// Create folder
await fs.mkdir(targetDir, { recursive: true });
// Copy base template
const baseTemplatePath = path.join(__dirname, "templates", "base");
await fs.copy(baseTemplatePath, targetDir);
// Language-specific adjustments
if (language === "js") {
    const jsExtrasPath = path.join(__dirname, "templates", "extra", "js");
    await fs.remove(path.join(targetDir, "tsconfig.json"));
    await fs.copy(path.join(jsExtrasPath, "layout.js"), path.join(targetDir, "app/layout.js"));
    await fs.copy(path.join(jsExtrasPath, "page.js"), path.join(targetDir, "app/page.js"));
    await fs.copy(path.join(jsExtrasPath, "jsconfig.json"), path.join(targetDir, "jsconfig.json"));
    await Promise.all([
        fs.remove(path.join(targetDir, "app/layout.tsx")),
        fs.remove(path.join(targetDir, "app/page.tsx")),
    ]);
}
if (language === "ts") {
    const tsExtrasPath = path.join(__dirname, "templates", "extra", "ts");
    await fs.copy(tsExtrasPath, targetDir, { overwrite: true });
}
//! The stylings
// ========== STYLING FILES ==========
const stylingsTargetDir = path.join(targetDir, "app");
let stylingTemplatePath;
if (styling === "tw") {
    stylingTemplatePath = path.join(__dirname, "templates", "extra", "tailwindcss");
}
else if (styling === "css") {
    stylingTemplatePath = path.join(__dirname, "templates", "extra", "css");
}
// ---------- CLEAN UP OLD FILES ----------
// Remove page.tsx or page.js
if (styling === "css") {
    const pageFileName = language === "ts" ? "page.tsx" : "page.js";
    const pageFilePath = path.join(stylingsTargetDir, pageFileName);
    if (await fs.pathExists(pageFilePath)) {
        await fs.remove(pageFilePath);
    }
    // Remove globals.css
    const globalsCssPath = path.join(stylingsTargetDir, "globals.css");
    if (await fs.pathExists(globalsCssPath)) {
        await fs.remove(globalsCssPath);
    }
}
// ---------- COPY NEW FILES ----------
// Tailwind → copy everything
if (styling === "tw") {
    await fs.copy(stylingTemplatePath, stylingsTargetDir, { overwrite: true });
}
// CSS → possibly rename .js → .tsx
if (styling === "css") {
    const files = await fs.readdir(stylingTemplatePath);
    for (const fileName of files) {
        const srcFile = path.join(stylingTemplatePath, fileName);
        let destFile = fileName;
        if (language === "ts" && fileName.endsWith(".js")) {
            destFile = fileName.replace(/\.js$/, ".tsx");
        }
        const destPath = path.join(stylingsTargetDir, destFile);
        await fs.copy(srcFile, destPath, { overwrite: true });
    }
}
//! api routes
if (apiRouteUse) {
    const apiTargetDir = path.join(targetDir, "app", "api", "user");
    await fs.mkdir(apiTargetDir, { recursive: true });
    const routeFileName = language === "ts" ? "route.ts" : "route.js";
    const routeSourcePath = path.join(__dirname, "templates", "extra", "api", language, routeFileName);
    const routeTargetPath = path.join(apiTargetDir, routeFileName);
    await fs.copy(routeSourcePath, routeTargetPath);
}
//! Zustand
if (zustandUse === "withZustand") {
    const storeDir = path.join(targetDir, "store");
    await fs.mkdir(storeDir, { recursive: true });
    const zustandFileName = language === "ts"
        ? "useUserStore.ts"
        : "useUserStore.js";
    const zustandSrcPath = path.join(__dirname, "templates", "extra", "zustand", language, zustandFileName);
    const zustandDestPath = path.join(storeDir, zustandFileName);
    await fs.copy(zustandSrcPath, zustandDestPath);
}
//! Copy actions folder
const actionFileName = language === "ts" ? "getUsers.ts" : "getUsers.js";
const actionSourcePath = path.join(__dirname, "templates", "extra", "actions", `action-${language}`, actionFileName);
const actionTargetPath = path.join(targetDir, "actions", actionFileName);
await fs.copy(actionSourcePath, actionTargetPath);
// Copy ESLint config if enabled
if (enableEslint === "yes") {
    const eslintConfigPath = path.join(__dirname, "templates", "extra", "eslint", "eslint.config.mjs");
    await fs.copy(eslintConfigPath, path.join(targetDir, "eslint.config.mjs"));
}
// Update package.json
const pkgPath = path.join(targetDir, "package.json");
const pkgExists = await fs.pathExists(pkgPath);
if (pkgExists) {
    const pkg = await fs.readJSON(pkgPath);
    pkg.name = projectName;
    pkg.description = "";
    if (language === "ts") {
        pkg.devDependencies = {
            ...(pkg.devDependencies || {}),
            typescript: "^5.0.0",
            "@types/react": "^19",
            "@types/node": "^20.0.0",
            "@types/react-dom": "^19",
        };
        if (enableEslint === "yes") {
            pkg.devDependencies = {
                ...pkg.devDependencies,
                eslint: "^9",
                "eslint-config-next": "15.3.5",
                "@eslint/eslintrc": "^3",
            };
        }
        if ("type" in pkg)
            delete pkg.type;
    }
    else if (language === "js") {
        if ("devDependencies" in pkg)
            delete pkg.devDependencies;
        if (enableEslint === "yes") {
            pkg.devDependencies = {
                eslint: "^9",
                "eslint-config-next": "15.3.5",
                "@eslint/eslintrc": "^3",
            };
        }
    }
    //!zustand logic
    // Add Tailwind dependencies if chosen
    if (styling === "tw") {
        pkg.devDependencies = {
            ...(pkg.devDependencies || {}),
            "@tailwindcss/postcss": "^4",
            "tailwindcss": "^4",
        };
    }
    if (zustandUse === "withZustand") {
        pkg.dependencies = {
            ...(pkg.dependencies || {}),
            zustand: "^5.0.6", // or whatever version you prefer
        };
    }
    pkg.scripts = {
        ...(pkg.scripts || {}),
        dev: useTurbopack === "yes" ? "next dev --turbopack" : "next dev",
        build: "next build",
        start: "next start",
    };
    await fs.writeJSON(pkgPath, pkg, { spaces: 2 });
}
// ========== Prompt for npm install ==========
if (pkgExists) {
    const installDeps = await select({
        message: "Execute order npm install ?",
        options: [
            { label: "Do it", value: "yes" },
            { label: "No", value: "no" },
        ],
    });
    if (isCancel(installDeps)) {
        outro("Operation cancelled.");
        process.exit(0);
    }
    if (installDeps === "yes") {
        console.log(chalk.cyan(`\nInstallation in progress`));
        await runNpmInstall(targetDir);
    }
}
else {
    console.log(chalk.yellow(`⚠️  No package.json found in ${targetDir}. Skipping npm install.`));
}
renderThanks();
// ------------------------------------------------------------
// HELPER FUNCTION: runNpmInstall
// ------------------------------------------------------------
function runNpmInstall(cwd) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["install"], {
            cwd,
            stdio: "inherit",
            shell: true,
        });
        child.on("close", (code) => {
            if (code === 0) {
                resolve();
            }
            else {
                reject(new Error(`npm install failed with exit code ${code}`));
            }
        });
    });
}
