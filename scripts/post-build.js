const fs = require('fs');
const path = require('path');

// Path constants
const outDir = path.join(process.cwd(), 'out');
const publicDir = path.join(process.cwd(), 'public');
const templatesDir = path.join(process.cwd(), 'templates');
const uploadsDir = path.join(process.cwd(), 'uploads');
const generatedDocsDir = path.join(process.cwd(), 'generated_docs');

console.log('=== Starting post-build processing ===');

// Create Netlify configuration files
const netlifyConfigPath = path.join(outDir, '_redirects');
if (!fs.existsSync(netlifyConfigPath)) {
  console.log('Creating Netlify _redirects file');
  fs.writeFileSync(netlifyConfigPath, `
# Handle client-side routing
/* /index.html 200
  `);
}

// Copy necessary directories to out folder
const directoriesToCopy = [
  { src: templatesDir, dest: path.join(outDir, 'templates'), name: 'templates' },
  { src: uploadsDir, dest: path.join(outDir, 'uploads'), name: 'uploads' },
  { src: generatedDocsDir, dest: path.join(outDir, 'generated_docs'), name: 'generated_docs' }
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
  console.log(`Copying ${dir.name} directory to out folder`);
  copyDir(dir.src, dir.dest);
}

console.log('=== Post-build processing complete ==='); 