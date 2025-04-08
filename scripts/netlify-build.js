/**
 * Netlify build script - runs the production build and sets up Netlify files
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Log with timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Ensure the templates directory is copied to the output
function copyTemplates() {
  log('Copying templates directory to output...');
  
  const templatesDir = path.join(process.cwd(), 'templates');
  const outTemplatesDir = path.join(process.cwd(), 'out', 'templates');
  
  if (!fs.existsSync(templatesDir)) {
    log('⚠️ Warning: templates directory not found in project root');
    return;
  }
  
  if (!fs.existsSync(outTemplatesDir)) {
    fs.mkdirSync(outTemplatesDir, { recursive: true });
  }
  
  // Copy all files from templates to out/templates
  const files = fs.readdirSync(templatesDir);
  let filesCopied = 0;
  
  files.forEach(file => {
    const sourcePath = path.join(templatesDir, file);
    const destPath = path.join(outTemplatesDir, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      // For directories, recursively copy
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      
      const subFiles = fs.readdirSync(sourcePath);
      subFiles.forEach(subFile => {
        const subSourcePath = path.join(sourcePath, subFile);
        const subDestPath = path.join(destPath, subFile);
        
        if (!fs.statSync(subSourcePath).isDirectory()) {
          fs.copyFileSync(subSourcePath, subDestPath);
          filesCopied++;
        }
      });
    } else {
      // For files, just copy
      fs.copyFileSync(sourcePath, destPath);
      filesCopied++;
    }
  });
  
  log(`✅ Copied ${filesCopied} template files to output directory`);
}

// Main build process
async function build() {
  try {
    // Set environment variables
    process.env.NETLIFY_NEXT_PLUGIN_SKIP = '1';
    
    // Run the production build
    log('Starting production build...');
    execSync('npm run build:production', { stdio: 'inherit' });
    
    // Create Netlify files
    log('Creating Netlify files...');
    execSync('node scripts/create-netlify-files.js', { stdio: 'inherit' });
    
    // Copy templates directory
    copyTemplates();
    
    // Also create an empty .nojekyll file to prevent GitHub Pages from using Jekyll
    const nojekyllPath = path.join(process.cwd(), 'out', '.nojekyll');
    fs.writeFileSync(nojekyllPath, '');
    
    log('✅ Build process completed successfully');
  } catch (error) {
    log(`❌ Build failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the build
build(); 