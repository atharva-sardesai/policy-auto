import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { mkdir, writeFile } from 'fs/promises'
import { generateDocument } from '@/utils/documentGenerator'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest): Promise<NextResponse> {
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
      return NextResponse.json({ 
        success: false, 
        error: "Company name and owner name are required." 
      }, { status: 400 });
    }
    
    // Parse selected templates
    let templateIds: string[] = [];
    try {
      templateIds = JSON.parse(selectedTemplates);
      console.log(`Parsed template IDs: ${JSON.stringify(templateIds)}`);
    } catch (parseError) {
      console.error('Error parsing template IDs:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: `Invalid template selection: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` 
      }, { status: 400 });
    }
    
    if (!templateIds.length) {
      return NextResponse.json({ 
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
    } catch (readError) {
      console.error('Error reading templates directory:', readError);
      return NextResponse.json({ 
        success: false, 
        error: `Could not read templates: ${readError instanceof Error ? readError.message : 'Unknown error'}` 
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
        } catch (statError) {
          console.error(`Error checking template file: ${statError}`);
          failedTemplates.push({
            id: templateId,
            error: `Error checking template file: ${statError instanceof Error ? statError.message : 'Unknown error'}`
          });
          continue;
        }
        
        // Generate document
        console.log(`Generating document from template: ${matchingFile}`);
        console.log(`Using logoPath: ${logoPath || 'none'}`);
        
        const outputPath = await generateDocument({
          templatePath,
          outputDir: docsDir,
          companyName,
          ownerName,
          logoPath
        });
        
        console.log(`Document generated successfully: ${outputPath}`);
        generatedDocs.push(path.basename(outputPath));
      } catch (templateError) {
        console.error(`Error processing template ${templateId}:`, templateError);
        failedTemplates.push({
          id: templateId,
          error: templateError instanceof Error ? templateError.message : 'Unknown error'
        });
      }
    }
    
    // Return results
    if (generatedDocs.length > 0) {
      return NextResponse.json({ 
        success: true, 
        documents: generatedDocs,
        generatedDocs,
        failedTemplates: failedTemplates.length > 0 ? failedTemplates : undefined
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to generate any documents", 
        failedTemplates 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in document generation API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}