import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("Document generation API called");
  
  try {
    const body = await request.json();
    const { templateId, companyName, companyAddress, companyEmail } = body;

    if (!templateId || !companyName || !companyAddress || !companyEmail) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Read the template file
    const templatePath = path.join(process.cwd(), 'templates', templateId);
    const templateContent = await fs.readFile(templatePath);

    // Generate a unique filename
    const filename = `${companyName.replace(/\s+/g, '_')}_${uuidv4()}.docx`;
    const outputPath = path.join(process.cwd(), 'generated_docs', filename);

    // Save the generated document
    await fs.writeFile(outputPath, templateContent);

    return new NextResponse(JSON.stringify({ 
      success: true, 
      filename,
      message: 'Document generated successfully'
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error generating document:', error);
    return new NextResponse('Failed to generate document', { status: 500 });
  }
}