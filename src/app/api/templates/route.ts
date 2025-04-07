import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { readdir } from 'fs/promises'
import { join } from 'path'
import { statSync, existsSync } from 'fs'

export async function GET() {
  try {
    const templatesDir = join(process.cwd(), 'templates')
    console.log(`Reading templates from directory: ${templatesDir}`);
    
    // Check if the directory exists first
    if (!existsSync(templatesDir)) {
      console.log('Templates directory does not exist');
      return NextResponse.json({
        templates: []
      });
    }
    
    try {
      const stats = statSync(templatesDir);
      if (!stats.isDirectory()) {
        console.log('Templates path exists but is not a directory');
        return NextResponse.json({
          templates: []
        });
      }
    } catch (statError) {
      console.error('Error checking templates directory:', statError);
      return NextResponse.json({
        templates: []
      });
    }

    // Read directory contents
    let files;
    try {
      files = await readdir(templatesDir);
      console.log(`Found ${files.length} files in templates directory`);
      console.log(`Raw file list: ${JSON.stringify(files)}`);
    } catch (readdirError) {
      console.error('Error reading templates directory:', readdirError);
      return NextResponse.json({
        templates: []
      });
    }
    
    // Filter for only Word documents and text files, and make sure they exist
    const templateFiles = files.filter(file => {
      // Skip directories and hidden files
      if (file.startsWith('.') || file === 'samples') return false;
      
      // Accept docx and txt files
      if (!file.endsWith('.docx') && !file.endsWith('.txt')) {
        console.log(`Skipping non-document file: ${file}`);
        return false;
      }
      
      // Additional check that file exists and is readable
      try {
        const filePath = join(templatesDir, file);
        const fileStats = statSync(filePath);
        const isValid = fileStats.isFile() && fileStats.size > 0;
        
        if (!isValid) {
          console.log(`Skipping invalid file: ${file} (isFile: ${fileStats.isFile()}, size: ${fileStats.size})`);
        }
        return isValid;
      } catch (fileError) {
        console.warn(`Error checking template file ${file}:`, fileError);
        return false;
      }
    });
    
    console.log(`Filtered template files: ${JSON.stringify(templateFiles)}`);
    
    // Format for the frontend - use the EXACT filename as the ID
    const templates = templateFiles.map(file => ({
      id: file, // Use exact filename with extension as ID
      name: file.replace(/\.(docx|txt)$/, '').replace(/_/g, ' ')
    }));
    
    console.log(`Returning ${templates.length} templates to frontend`);
    console.log(`Template data: ${JSON.stringify(templates)}`);
    
    return NextResponse.json({
      templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({
      error: 'Failed to fetch templates',
      templates: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const file = formData.get("file") as File

    if (!name || !type || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In a real app, you would upload the template file to Vercel Blob
    // const blob = await put(`templates/${uuidv4()}.docx`, file, {
    //   access: 'private',
    // })

    // In a real app, you would save template metadata to your database
    const templateId = uuidv4()

    return NextResponse.json({
      id: templateId,
      name,
      type,
      updatedAt: new Date().toISOString().split("T")[0],
      message: "Template uploaded successfully",
    })
  } catch (error) {
    console.error("Error uploading template:", error)
    return NextResponse.json({ error: "Failed to upload template" }, { status: 500 })
  }
}

