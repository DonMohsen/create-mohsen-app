#!/usr/bin/env node
import { intro, text, select, outro, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import gradient from 'gradient-string';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const TITLE_TEXT = `
    ____                   __  ___      __                   
   / __ \\____  ____       /  |/  /___  / /_  ________  ____ 
  / / / / __ \\/ __ \\     / /|_/ / __ \\/ __ \\/ ___/ _ \\/ __ \\
 / /_/ / /_/ / / / /    / /  / / /_/ / / / (__  )  __/ / / /
/_____/\\____/_/ /_/    /_/  /_/\\____/_/ /_/____/\\___/_/ /_/ 
`;
export const renderTitle = () => {
    const gradientTheme = {
        blue: "#add7ff",
        cyan: "#89ddff",
        green: "#5de4c7",
        magenta: "#fae4fc",
        red: "#d0679d",
        yellow: "#fffac2",
    };
    const Gradient = gradient(Object.values(gradientTheme));
    console.log(Gradient.multiline(TITLE_TEXT));
};
console.clear();
intro(chalk.bgBlue(' Create Mohsen App CLI '));
renderTitle();
// Ask for project name
const projectNameRaw = await text({
    message: '📦 App name:',
    placeholder: 'my-app',
    validate: (value) => (!value ? 'Required' : undefined),
});
if (isCancel(projectNameRaw)) {
    outro('Operation cancelled.');
    process.exit(0);
}
let targetDir;
let projectName;
if (projectNameRaw === '.') {
    const confirm = await select({
        message: '⚠️  You chose the current directory. Proceed?',
        options: [
            { label: 'Yes, create into current directory and overwrite existing data', value: 'yes' },
            { label: 'No, cancel', value: 'no' },
        ],
    });
    if (isCancel(confirm) || confirm === 'no') {
        outro('Operation cancelled.');
        process.exit(0);
    }
    targetDir = process.cwd();
    projectName = path.basename(targetDir);
}
else {
    targetDir = path.resolve(process.cwd(), projectNameRaw);
    projectName = projectNameRaw;
}
// 🛑 Check if target directory is non-empty
if (await fs.pathExists(targetDir)) {
    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
        outro(chalk.red(`❌ The target directory "${targetDir}" is not empty.`));
        process.exit(1);
    }
}
else {
    await fs.mkdir(targetDir, { recursive: true });
}
// 🧠 Ask for language
const language = await select({
    message: '🧠 Language:',
    options: [
        { label: 'TypeScript', value: 'ts' },
        { label: 'JavaScript', value: 'js' },
    ],
});
if (isCancel(language)) {
    outro('Operation cancelled.');
    process.exit(0);
}
// 📁 Copy base template
const baseTemplatePath = path.join(__dirname, 'templates', 'base');
await fs.copy(baseTemplatePath, targetDir);
// --- Language-specific adjustments ---
if (language === 'js') {
    const jsExtrasPath = path.join(__dirname, 'templates', 'extra', 'js');
    await fs.remove(path.join(targetDir, 'tsconfig.json'));
    await fs.copy(path.join(jsExtrasPath, 'layout.jsx'), path.join(targetDir, 'app/layout.jsx'));
    await fs.copy(path.join(jsExtrasPath, 'page.jsx'), path.join(targetDir, 'app/page.jsx'));
    await Promise.all([
        fs.remove(path.join(targetDir, 'app/layout.tsx')),
        fs.remove(path.join(targetDir, 'app/page.tsx')),
    ]);
}
if (language === 'ts') {
    const tsExtrasPath = path.join(__dirname, 'templates', 'extra', 'ts');
    await fs.copy(tsExtrasPath, targetDir, { overwrite: true });
}
// 🔧 Update package.json
const pkgPath = path.join(targetDir, 'package.json');
const pkg = await fs.readJSON(pkgPath);
pkg.name = projectName;
pkg.description = '';
if (language === 'ts') {
    pkg.devDependencies = {
        typescript: '^5.0.0',
        '@types/react': '^18.0.0',
        '@types/node': '^20.0.0',
    };
    if ('type' in pkg)
        delete pkg.type;
}
else if (language === 'js') {
    if ('devDependencies' in pkg)
        delete pkg.devDependencies;
}
await fs.writeJSON(pkgPath, pkg, { spaces: 2 });
// ✅ Done!
outro(`✅ Project "${projectName}" created as ${language === 'ts' ? 'TypeScript' : 'JavaScript'} project in:\n${chalk.green(targetDir)}`);
