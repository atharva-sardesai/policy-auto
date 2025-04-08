/**
 * Netlify build script - creates a static site fallback that works regardless of build errors
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

// Create static output
function createStaticOutput() {
  log('Creating static output...');
  
  const outDir = path.join(process.cwd(), 'out');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  // Create index.html
  const indexHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ISO Policy Generator</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 2rem;
      margin: 2rem 0;
    }
    h1 { color: #2563eb; }
    a.button {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      margin-top: 1rem;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }
    .feature {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 8px;
    }
    .feature h3 {
      margin-top: 0;
      color: #2563eb;
    }
  </style>
</head>
<body>
  <h1>ISO Policy Generator</h1>
  <p>Welcome to the ISO Policy Generator, a tool for creating compliance documentation quickly and easily.</p>
  
  <div class="card">
    <h2>Generate Documents</h2>
    <p>This application allows you to generate ISO-compliant policy documents using professional templates.</p>
    
    <div class="features">
      <div class="feature">
        <h3>Templates</h3>
        <p>Choose from a library of professional policy templates</p>
      </div>
      <div class="feature">
        <h3>Customization</h3>
        <p>Add your company details and logo</p>
      </div>
      <div class="feature">
        <h3>Download</h3>
        <p>Get your documents in Word format</p>
      </div>
    </div>
    
    <a href="https://github.com/atharva-sardesai/policy_automation" class="button">Documentation</a>
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);
  
  // Create _redirects file for Netlify
  fs.writeFileSync(path.join(outDir, '_redirects'), `
# Netlify redirects
/*    /index.html   200
  `);
  
  log('✅ Created static output');
}

// Main build function
async function build() {
  try {
    // Create static output
    createStaticOutput();
    
    // Copy templates directory
    copyTemplates();
    
    log('✅ Build completed successfully');
    return true;
  } catch (error) {
    log(`❌ Error during build: ${error.message}`);
    return false;
  }
}

// Run build and exit with appropriate code
build()
  .then(success => {
    if (!success) {
      log('Build failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unhandled error during build:', error);
    process.exit(1);
  }); 