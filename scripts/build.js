const fs = require('fs');
const path = require('path');

// Directory paths
const uploadsDir = path.join(process.cwd(), 'uploads');
const generatedDocsDir = path.join(process.cwd(), 'generated_docs');
const templatesDir = path.join(process.cwd(), 'templates');

// Ensure directories exist
console.log('Creating required directories...');

if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory: ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(generatedDocsDir)) {
  console.log(`Creating generated_docs directory: ${generatedDocsDir}`);
  fs.mkdirSync(generatedDocsDir, { recursive: true });
}

if (!fs.existsSync(templatesDir)) {
  console.log(`Creating templates directory: ${templatesDir}`);
  fs.mkdirSync(templatesDir, { recursive: true });
}

console.log('Required directories created successfully.'); 