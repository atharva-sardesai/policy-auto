const fs = require('fs');
const path = require('path');

// Path constants
const nextDir = path.join(process.cwd(), '.next');
const standaloneDir = path.join(nextDir, 'standalone');
const publicDir = path.join(process.cwd(), 'public');
const templatesDir = path.join(process.cwd(), 'templates');
const uploadsDir = path.join(process.cwd(), 'uploads');
const generatedDocsDir = path.join(process.cwd(), 'generated_docs');

console.log('=== Starting post-build fixes for standalone output ===');

// Check if standalone directory exists
if (!fs.existsSync(standaloneDir)) {
  console.log('Standalone directory not found, creating it');
  fs.mkdirSync(standaloneDir, { recursive: true });
} else {
  console.log('Standalone directory exists');
}

// Copy necessary directories to standalone
const directoriesToCopy = [
  { src: publicDir, dest: path.join(standaloneDir, 'public'), name: 'public' },
  { src: templatesDir, dest: path.join(standaloneDir, 'templates'), name: 'templates' },
  { src: uploadsDir, dest: path.join(standaloneDir, 'uploads'), name: 'uploads' },
  { src: generatedDocsDir, dest: path.join(standaloneDir, 'generated_docs'), name: 'generated_docs' }
];

// Function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`Source directory not found: ${src}`);
    fs.mkdirSync(dest, { recursive: true });
    return;
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy all needed directories
for (const dir of directoriesToCopy) {
  console.log(`Copying ${dir.name} directory to standalone`);
  copyDir(dir.src, dir.dest);
}

console.log('=== Post-build fixes complete ==='); 