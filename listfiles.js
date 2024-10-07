const fs = require('fs');
const path = require('path');
const ignore = require('ignore');

const projectDir = path.resolve(__dirname); // Adjust this if the script is not in the project root
const gitignorePath = path.join(projectDir, '.gitignore');

const allowedExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', '.sass', '.html', '.md']);
let ig = ignore();

// Read and add .gitignore patterns
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  ig = ig.add(gitignoreContent);
}

// Custom exclusions
const customExclusions = [
  'node_modules',
  '.git',
  '.git/hooks',
  '.git/info',
  '.git/logs',
  '.git/logs/refs',
  '.git/logs/refs/heads',
  '.git/logs/refs/remotes',
  '.git/logs/refs/remotes/origin',
  '.git/objects',
  '.git/refs',
  '.git/refs/heads',
  '.git/refs/remotes',
  '.git/refs/remotes/origin',
  '.git/refs/tags',
  '.next',
  '.vscode',
  'public',
  'public/Cesium',
  'public/Cesium/Assets',
  'public/Cesium/ThirdParty',
  'public/Cesium/Widgets',
  'public/Cesium/Workers',
  'package-lock.json',
];

// Add custom exclusions to ignore
ig = ig.add(customExclusions.map(pattern => `/${pattern}`));

// Store file paths for printing later
const filePaths = [];

function listFiles(dir, relativePath = '') {
  const files = fs.readdirSync(dir);

  // Filter files and directories based on .gitignore and custom exclusions
  const filteredFiles = ig.filter(files.map(file => path.join(relativePath, file)));

  filteredFiles.forEach(relPath => {
    const fullPath = path.join(projectDir, relPath);

    if (fs.statSync(fullPath).isDirectory()) {
      console.log(`Directory: ${relPath}/`);
      listFiles(fullPath, relPath);
    } else if (allowedExtensions.has(path.extname(fullPath))) {
      console.log(`File: ${relPath}`);
      filePaths.push(fullPath);
    }
  });
}

console.log(`Scanning project directory: ${projectDir}`);
listFiles(projectDir);

// Print each file with its full path
filePaths.forEach(filePath => {
  console.log(`\nFull path: ${filePath}\n`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  console.log(fileContent);
});
