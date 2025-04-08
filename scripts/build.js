const fs = require('fs');
const path = require('path');

// Directory paths
const uploadsDir = path.join(process.cwd(), 'uploads');
const generatedDocsDir = path.join(process.cwd(), 'generated_docs');
const templatesDir = path.join(process.cwd(), 'templates');

console.log('=== Starting build process ===');
console.log(`Current working directory: ${process.cwd()}`);
console.log(`Node.js version: ${process.version}`);
console.log(`OS: ${process.platform}`);

// Ensure directories exist
console.log('\n=== Creating required directories ===');

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

// Check if sample template exists, if not create one
if (fs.readdirSync(templatesDir).length === 0) {
  console.log('\n=== Creating sample template ===');
  const sampleTemplate = `
Company Name: {Company_Name}
Owner Name: {Owner_Name}
Date: {current_date}

This is a sample template file created during the build process.
  `;
  
  fs.writeFileSync(path.join(templatesDir, 'Sample_Template.txt'), sampleTemplate);
  console.log('Created Sample_Template.txt');
}

console.log('\n=== Required directories created successfully ===');
console.log('=== Build setup complete ===\n'); 