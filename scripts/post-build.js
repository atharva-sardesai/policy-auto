const fs = require('fs');
const path = require('path');

// Path constants
const outDir = path.join(process.cwd(), 'out');
const publicDir = path.join(process.cwd(), 'public');
const templatesDir = path.join(process.cwd(), 'templates');
const uploadsDir = path.join(process.cwd(), 'uploads');
const generatedDocsDir = path.join(process.cwd(), 'generated_docs');

console.log('=== Starting post-build processing ===');

// Check if output directory exists
if (!fs.existsSync(outDir)) {
  console.log('Output directory not found, creating it');
  fs.mkdirSync(outDir, { recursive: true });
} else {
  console.log('Output directory exists');
}

// Create _redirects file (Netlify standard) instead of netlify.toml
const redirectsContent = `
# Handle client-side routing
/*    /index.html   200
`;

try {
  fs.writeFileSync(path.join(outDir, '_redirects'), redirectsContent);
  console.log('Created _redirects file in the output directory');
} catch (error) {
  console.error(`Error creating _redirects file: ${error.message}`);
}

// Copy necessary directories to output
const directoriesToCopy = [
  { src: templatesDir, dest: path.join(outDir, 'templates'), name: 'templates' },
  { src: uploadsDir, dest: path.join(outDir, 'uploads'), name: 'uploads' },
  { src: generatedDocsDir, dest: path.join(outDir, 'generated_docs'), name: 'generated_docs' }
];

// Function to copy directory recursively with better error handling
function copyDir(src, dest) {
  try {
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
      try {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      } catch (entryError) {
        console.error(`Error processing ${entry.name}: ${entryError.message}`);
      }
    }
  } catch (dirError) {
    console.error(`Error in copyDir for ${src}: ${dirError.message}`);
  }
}

// Copy public directory first if it exists
if (fs.existsSync(publicDir)) {
  console.log('Copying public assets to output directory');
  copyDir(publicDir, outDir);
}

// Copy all needed directories
for (const dir of directoriesToCopy) {
  console.log(`Copying ${dir.name} directory to out folder`);
  copyDir(dir.src, dir.dest);
}

// Make sure the output directory has an index.html
if (!fs.existsSync(path.join(outDir, 'index.html'))) {
  console.log('No index.html found in output directory, creating a simple one');
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ISO Policy Automation</title>
  <style>
    :root {
      --primary: #2563eb;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #1e293b;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: var(--text);
      background: var(--bg);
      line-height: 1.6;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    h1 { 
      color: var(--primary);
      margin-bottom: 1rem;
    }
    
    .card {
      background: var(--card-bg);
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
      padding: 2rem;
      margin: 2rem 0;
    }
    
    .btn {
      display: inline-block;
      background: var(--primary);
      color: white;
      padding: 0.75rem 1.5rem;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>ISO Policy Automation</h1>
    <p>Generate ISO-compliant policy documents quickly and easily.</p>
    
    <div class="card">
      <h2>Welcome!</h2>
      <p>This is a fallback page created during the Netlify deployment process.</p>
      <p>The full application will be available soon.</p>
    </div>
  </div>
</body>
</html>
  `;
  
  try {
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log('Created index.html in the output directory');
  } catch (htmlError) {
    console.error(`Error creating index.html: ${htmlError.message}`);
  }
}

console.log('=== Post-build processing complete ==='); 