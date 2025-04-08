/**
 * This script creates all the necessary files for Netlify to host 
 * a static site properly, without requiring the Next.js plugin.
 */

const fs = require('fs');
const path = require('path');

// Path constants
const outDir = path.join(process.cwd(), 'out');
const nextDir = path.join(outDir, '.next');

console.log('=== Creating Netlify-specific files ===');

// Ensure output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Create _redirects file for proper routing
const redirectsContent = `
# Netlify redirects
/*    /index.html   200
`;

try {
  fs.writeFileSync(path.join(outDir, '_redirects'), redirectsContent);
  console.log('Created _redirects file');
} catch (error) {
  console.error(`Error creating _redirects file: ${error.message}`);
}

// Create a dummy .next directory structure to satisfy the Netlify plugin
try {
  if (!fs.existsSync(nextDir)) {
    fs.mkdirSync(nextDir, { recursive: true });
  }
  
  // Create server directory
  const serverDir = path.join(nextDir, 'server');
  if (!fs.existsSync(serverDir)) {
    fs.mkdirSync(serverDir, { recursive: true });
  }
  
  // Create pages directory
  const pagesDir = path.join(serverDir, 'pages');
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
  }
  
  // Create static directory
  const staticDir = path.join(nextDir, 'static');
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }
  
  // Create cache directory
  const cacheDir = path.join(nextDir, 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  
  // Create required files
  
  // Create next-config.json
  const nextConfigJson = {
    target: "server",
    compress: true,
    distDir: ".next",
    generateEtags: true
  };
  
  fs.writeFileSync(
    path.join(nextDir, 'next-config.json'),
    JSON.stringify(nextConfigJson, null, 2)
  );
  
  // Create required-server-files.json
  const requiredServerFilesJson = {
    version: 1,
    config: {
      distDir: ".next",
      publicRuntimeConfig: {},
      serverRuntimeConfig: {}
    }
  };
  
  fs.writeFileSync(
    path.join(nextDir, 'required-server-files.json'),
    JSON.stringify(requiredServerFilesJson, null, 2)
  );
  
  // Create build-manifest.json
  const buildManifestJson = {
    pages: {
      "/_app": [],
      "/": [],
      "/generate": []
    }
  };
  
  fs.writeFileSync(
    path.join(nextDir, 'build-manifest.json'),
    JSON.stringify(buildManifestJson, null, 2)
  );
  
  // Create _next folder in the out directory
  const nextPublicDir = path.join(outDir, '_next');
  if (!fs.existsSync(nextPublicDir)) {
    fs.mkdirSync(nextPublicDir, { recursive: true });
  }
  
  console.log('Created Next.js dummy structure');
} catch (error) {
  console.error(`Error creating Next.js structure: ${error.message}`);
}

// Create a netlify.toml file in the out directory
const netlifyTomlContent = `
# Netlify configuration for static deployment
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

try {
  fs.writeFileSync(path.join(outDir, 'netlify.toml'), netlifyTomlContent);
  console.log('Created netlify.toml in output directory');
} catch (error) {
  console.error(`Error creating netlify.toml: ${error.message}`);
}

console.log('=== Netlify files created successfully ==='); 