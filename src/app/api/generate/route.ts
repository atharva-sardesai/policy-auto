import { NextRequest, NextResponse } from 'next/server'
import { join, basename } from 'path'
import { mkdir, writeFile } from 'fs/promises'
import { existsSync, readdirSync, statSync, readFileSync } from 'fs'
import { generateDocument } from '@/utils/documentGenerator'
import fs from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'

// Helper function to directly use Python without going through the document generator
async function generateWithPython(templatePath: string, outputDir: string, companyName: string, ownerName: string, logoPath?: string): Promise<string> {
  const pythonScript = path.join(process.cwd(), 'scripts', 'generate_policy.py')
  
  // Check if Python is installed by running a simple test command
  let pythonAvailable = false;
  try {
    execSync('python --version', { stdio: 'ignore' });
    pythonAvailable = true;
    console.log("Python is available on this system");
  } catch (e) {
    console.log("Python is not available on this system, will use JavaScript fallback");
  }
  
  // If Python is not available, fall back to JavaScript implementation
  if (!pythonAvailable) {
    console.log("Using JavaScript fallback for document generation");
    return await generateDocument({
      templatePath,
      outputDir,
      companyName,
      ownerName,
      logoPath
    });
  }
  
  if (!existsSync(pythonScript)) {
    console.log("Python script not found, using JavaScript fallback");
    return await generateDocument({
      templatePath,
      outputDir,
      companyName,
      ownerName,
      logoPath
    });
  }
  
  // Create a predictable output path pattern that we can find later
  const templateName = path.basename(templatePath, path.extname(templatePath))
  const sanitizedCompanyName = companyName.replace(/\s+/g, '_')
  const timestamp = Math.floor(Date.now()/1000)
  const expectedFilename = `${sanitizedCompanyName}_${templateName}_${timestamp}.docx`
  const expectedPath = path.join(outputDir, expectedFilename)
  
  // Create log file path
  const logFilePath = path.join(process.cwd(), 'python_output.log')
  
  // Build command with redirected output - fix Windows path issues
  let command;
  if (process.platform === 'win32') {
    // On Windows, ensure paths with spaces are properly quoted
    command = `python "${pythonScript}" "${templatePath}" "${outputDir}" "${companyName}" "${ownerName}" ${logoPath ? `"${logoPath}"` : "null"}`;
  } else {
    // For Unix-like systems
    command = `python "${pythonScript}" "${templatePath}" "${outputDir}" "${companyName}" "${ownerName}" ${logoPath ? `"${logoPath}"` : "null"} > "${logFilePath}" 2>&1`;
  }
  
  console.log(`Executing Python command: ${command}`)
  
  try {
    // Execute Python script without redirecting output on Windows
    if (process.platform === 'win32') {
      execSync(command, { 
        timeout: 60000, // 60 seconds timeout
        stdio: ['ignore', 'pipe', 'pipe'], // Capture output but don't pass stdin
        windowsHide: true,
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
    } else {
      // Use redirection for Unix-like systems
      execSync(command, { 
        timeout: 60000,
        stdio: 'ignore'
      });
    }
    
    // Check if our expected file was created
    if (existsSync(expectedPath)) {
      return expectedPath
    }
    
    // If the expected file wasn't created, look for the most recent docx file with matching company name
    const files = readdirSync(outputDir)
    const recentFiles = files
      .filter(file => file.endsWith('.docx') && file.includes(sanitizedCompanyName))
      .map(file => {
        const filePath = path.join(outputDir, file)
        const stats = statSync(filePath)
        return { path: filePath, mtime: stats.mtime }
      })
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    
    if (recentFiles.length > 0) {
      return recentFiles[0].path
    }
    
    // If no matching file found, try JavaScript fallback
    console.log("Python did not generate any files, using JavaScript fallback");
    return await generateDocument({
      templatePath,
      outputDir,
      companyName,
      ownerName,
      logoPath
    });
  } catch (error: any) {
    console.error(`Error executing Python: ${error.message}`);
    
    // Try to read log file for more info
    if (existsSync(logFilePath)) {
      try {
        const logContent = readFileSync(logFilePath, 'utf8');
        console.error(`Python log (last 500 chars): ${logContent.slice(-500)}`);
      } catch (logError: any) {
        console.error(`Error reading Python log: ${logError.message}`);
      }
    }
    
    // Fall back to JavaScript implementation on Python error
    console.log("Python execution failed, using JavaScript fallback");
    return await generateDocument({
      templatePath,
      outputDir,
      companyName,
      ownerName,
      logoPath
    });
  }
}

export async function POST(request: NextRequest) {
  console.log("Document generation API called");
  
  try {
    // Parse form data
    const formData = await request.formData();
    const companyName = formData.get('companyName') as string;
    const ownerName = formData.get('ownerName') as string;
    const logo = formData.get('logo') as File | null;
    const selectedTemplates = formData.get('templates') as string; // JSON string of template IDs
    
    console.log(`Generating documents for ${companyName}, owner: ${ownerName}`);
    console.log(`Selected templates: ${selectedTemplates}`);
    
    // Check required fields
    if (!companyName || !ownerName) {
      return Response.json({ 
        success: false, 
        error: "Company name and owner name are required." 
      }, { status: 400 });
    }
    
    // Parse selected templates
    let templateIds: string[] = [];
    try {
      templateIds = JSON.parse(selectedTemplates);
      console.log(`Parsed template IDs: ${JSON.stringify(templateIds)}`);
    } catch (parseError: any) {
      console.error('Error parsing template IDs:', parseError?.message);
      return Response.json({ 
        success: false, 
        error: `Invalid template selection: ${parseError?.message}` 
      }, { status: 400 });
    }
    
    if (!templateIds.length) {
      return Response.json({ 
        success: false, 
        error: "No templates selected." 
      }, { status: 400 });
    }
    
    // Create necessary directories
    const uploadsDir = join(process.cwd(), 'uploads');
    const docsDir = join(process.cwd(), 'generated_docs');
    const templatesDir = join(process.cwd(), 'templates');
    
    await mkdir(uploadsDir, { recursive: true });
    await mkdir(docsDir, { recursive: true });
    
    // Process logo if provided
    let logoPath: string | undefined = undefined;
    
    if (logo) {
      console.log(`Logo provided: ${logo.name}, size: ${logo.size} bytes, type: ${logo.type}`);
      
      // Save logo file
      const logoBuffer = Buffer.from(await logo.arrayBuffer());
      const logoFilename = `${Date.now()}_${logo.name.replace(/\s+/g, '_')}`;
      logoPath = join(uploadsDir, logoFilename);
      
      await writeFile(logoPath, logoBuffer);
      console.log(`Logo saved to: ${logoPath}`);
    }
    
    // Generate documents for each selected template
    const generatedDocs: string[] = [];
    const failedTemplates: Array<{ id: string; error: string }> = [];
    
    // Get list of available template files
    let templateFiles: string[] = [];
    try {
      templateFiles = await fs.readdir(templatesDir);
      console.log(`Found ${templateFiles.length} template files in ${templatesDir}`);
    } catch (readError: any) {
      console.error('Error reading templates directory:', readError?.message);
      return Response.json({ 
        success: false, 
        error: `Could not read templates: ${readError?.message}` 
      }, { status: 500 });
    }
    
    // Process each selected template
    for (const templateId of templateIds) {
      try {
        console.log(`Processing template ID: ${templateId}`);
        console.log(`Available templates: ${JSON.stringify(templateFiles)}`);
        
        // Find matching template file
        let matchingFile = templateFiles.find(file => {
          // Try exact filename match first
          if (file === templateId) {
            console.log(`Found exact match for template: ${templateId}`);
            return true;
          }
          
          // Try without extension match
          const fileWithoutExt = file.replace(/\.\w+$/, '');
          const templateIdWithoutExt = templateId.replace(/\.\w+$/, '');
          
          if (fileWithoutExt === templateIdWithoutExt) {
            console.log(`Found match without extension: ${fileWithoutExt} = ${templateIdWithoutExt}`);
            return true;
          }
          
          // Try case-insensitive match
          if (fileWithoutExt.toLowerCase() === templateIdWithoutExt.toLowerCase()) {
            console.log(`Found case-insensitive match: ${fileWithoutExt} ~ ${templateIdWithoutExt}`);
            return true;
          }
          
          return false;
        });
        
        // If no match found, try more aggressive matching as fallback
        if (!matchingFile) {
          console.log(`No direct match found, trying fallback matching for: ${templateId}`);
          
          // Try to find any template containing the template ID (without extension)
          const templateIdWithoutExt = templateId.replace(/\.\w+$/, '').toLowerCase();
          matchingFile = templateFiles.find(file => {
            // Check if the file contains the template ID as part of its name
            return file.toLowerCase().includes(templateIdWithoutExt);
          });
          
          if (matchingFile) {
            console.log(`Found partial match through fallback: ${matchingFile}`);
          }
        }
        
        if (!matchingFile) {
          console.error(`Template not found: ${templateId}`);
          failedTemplates.push({
            id: templateId,
            error: `Template not found: ${templateId}`
          });
          continue;
        }
        
        const templatePath = join(templatesDir, matchingFile);
        console.log(`Processing template: ${templatePath}`);
        
        // Check if template file exists
        try {
          const stats = await fs.stat(templatePath);
          console.log(`Template file size: ${stats.size} bytes`);
          
          if (stats.size === 0) {
            throw new Error('Template file is empty');
          }
        } catch (statError: any) {
          console.error(`Error checking template file: ${statError?.message}`);
          failedTemplates.push({
            id: templateId,
            error: `Error checking template file: ${statError?.message}`
          });
          continue;
        }
        
        // Generate document using Python directly
        console.log(`Generating document from template: ${matchingFile}`);
        console.log(`Using logoPath: ${logoPath || 'none'}`);
        
        const outputPath = await generateWithPython(
          templatePath,
          docsDir,
          companyName,
          ownerName,
          logoPath
        );
        
        console.log(`Document generated successfully: ${outputPath}`);
        generatedDocs.push(path.basename(outputPath));
      } catch (templateError: any) {
        console.error(`Error processing template ${templateId}:`, templateError?.message);
        failedTemplates.push({
          id: templateId,
          error: templateError?.message || 'Unknown error'
        });
      }
    }
    
    // Return results
    if (generatedDocs.length > 0) {
      return Response.json({ 
        success: true, 
        documents: generatedDocs,
        generatedDocs,
        failedTemplates: failedTemplates.length > 0 ? failedTemplates : undefined
      });
    } else {
      return Response.json({ 
        success: false, 
        error: "Failed to generate any documents", 
        failedTemplates 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in document generation API:', error?.message);
    return Response.json({ 
      success: false, 
      error: error?.message || "Unknown error" 
    }, { status: 500 });
  }
} 