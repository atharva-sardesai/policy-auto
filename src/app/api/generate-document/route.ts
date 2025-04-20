import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// In a real app, you would use a library like docx.js to generate the document
// This is a simplified example

// Ensure this route is not statically optimized
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.companyName || !data.templateId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Ensure directories exist
    const templatesDir = path.join(process.cwd(), 'templates')
    const outputDir = path.join(process.cwd(), 'generated_docs')
    await fs.mkdir(outputDir, { recursive: true })

    // Read the template file
    const templatePath = path.join(templatesDir, data.templateId)
    try {
      await fs.access(templatePath)
    } catch {
      console.error(`Template not found: ${templatePath}`)
      return new NextResponse('Template not found', { status: 404 })
    }

    const templateContent = await fs.readFile(templatePath)

    // Generate a unique filename
    const filename = `${data.companyName.replace(/\s+/g, '_')}_${uuidv4()}.docx`
    const outputPath = path.join(outputDir, filename)

    // Save the generated document
    await fs.writeFile(outputPath, templateContent)

    return new NextResponse(JSON.stringify({
      success: true,
      documentId: filename,
      message: 'Document generated successfully'
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error("Error generating document:", error)
    return new NextResponse('Failed to generate document', { status: 500 })
  }
}

