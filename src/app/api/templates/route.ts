import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), 'templates')
    console.log(`Reading templates from directory: ${templatesDir}`);
    
    // Check if the directory exists first
    try {
      await fs.access(templatesDir);
    } catch {
      console.log('Templates directory does not exist');
      return new NextResponse(JSON.stringify({ templates: [] }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Read directory contents
    const files = await fs.readdir(templatesDir);
    
    // Filter for .docx files and map to template objects
    const templates = await Promise.all(
      files
        .filter(file => file.endsWith('.docx'))
        .map(async file => {
          const filePath = path.join(templatesDir, file);
          const stats = await fs.stat(filePath);
          return {
            id: file,
            name: file.replace('.docx', ''),
            type: 'docx',
            size: stats.size,
            lastModified: stats.mtime.toISOString()
          };
        })
    );
    
    console.log(`Returning ${templates.length} templates to frontend`);
    console.log(`Template data: ${JSON.stringify(templates)}`);
    
    return new NextResponse(JSON.stringify({ templates }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error listing templates:', error);
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to list templates',
      templates: [] 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const file = formData.get("file") as File

    if (!name || !type || !file) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Ensure templates directory exists
    const templatesDir = path.join(process.cwd(), 'templates')
    await fs.mkdir(templatesDir, { recursive: true })

    // Generate a unique filename
    const filename = `${name.replace(/\s+/g, '_')}_${uuidv4()}.docx`
    const filePath = path.join(templatesDir, filename)

    // Save the template file
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    return new NextResponse(JSON.stringify({
      id: filename,
      name,
      type,
      updatedAt: new Date().toISOString().split("T")[0],
      message: "Template uploaded successfully",
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error("Error uploading template:", error)
    return new NextResponse('Failed to upload template', { status: 500 })
  }
}

