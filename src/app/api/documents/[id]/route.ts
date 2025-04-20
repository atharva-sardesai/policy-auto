import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Ensure this route is not statically optimized
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Get the ID from the URL
    const id = request.url.split('/').pop();
    if (!id) {
      return new NextResponse('Document ID is required', { status: 400 });
    }

    // Construct safe file path
    const filePath = path.join(process.cwd(), 'generated_docs', id);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse('Document not found', { status: 404 });
    }

    // Read and return the file
    const content = await fs.readFile(filePath);

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${id}"`,
      },
    });
  } catch (error) {
    console.error('Error retrieving document:', error);
    return new NextResponse('Failed to retrieve document', { status: 500 });
  }
}

