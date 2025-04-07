const fs = require('fs');
const path = require('path');

// Create required directories
function ensureDirectories() {
  const dirs = [
    path.join(__dirname, '..', 'uploads'),
    path.join(__dirname, '..', 'templates'),
    path.join(__dirname, '..', 'generated_policies')
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// Check if a sample template exists
function ensureSampleTemplate() {
  const templateDir = path.join(__dirname, '..', 'templates');
  const samplePath = path.join(templateDir, 'Sample_Policy.txt');
  
  if (!fs.existsSync(samplePath)) {
    console.log('Creating sample template file');
    fs.writeFileSync(
      samplePath, 
      'This is a sample policy template. Replace {Company_Name} and {Owner_Name} with your details.'
    );
  }
}

// Main function
async function main() {
  try {
    ensureDirectories();
    ensureSampleTemplate();
    
    console.log('Setup completed successfully!');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 