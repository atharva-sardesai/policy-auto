import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;
    const docsDir = path.join(process.cwd(), 'generated_docs');
    const filePath = path.join(docsDir, id);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await fs.readFile(filePath);
    
    // Create response with file
    const response = new NextResponse(fileBuffer);
    
    // Set appropriate headers
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    response.headers.set('Content-Disposition', `attachment; filename="${id}"`);
    
    return response;
  } catch (error) {
    console.error('Error serving document:', error);
    return NextResponse.json(
      { error: 'Failed to serve document' },
      { status: 500 }
    );
  }
}

