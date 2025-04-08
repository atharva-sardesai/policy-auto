import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Updated to match Next.js 15.2.4 requirements for context
type Context = {
  params: {
    filename: string;
  }
}

export async function GET(
  request: NextRequest,
  context: Context
) {
  try {
    // Access the filename from context safely
    if (!context || !context.params) {
      return new Response('Missing filename parameter', { status: 400 });
    }
    
    const filename = context.params.filename;
    const decodedFilename = decodeURIComponent(filename);
    console.log(`Downloading file: ${decodedFilename}`);
    
    // Ensure the filename is safe - don't allow path traversal
    if (decodedFilename.includes('..') || decodedFilename.includes('/') || decodedFilename.includes('\\')) {
      return new Response('Invalid filename', { status: 400 });
    }
    
    // Path to the generated docs directory
    const docsDir = path.join(process.cwd(), 'generated_docs');
    const filePath = path.join(docsDir, decodedFilename);
    
    console.log(`Looking for file at: ${filePath}`);
    
    try {
      // Check if file exists
      const stats = await fs.stat(filePath);
      
      if (!stats.isFile()) {
        console.error(`Not a file: ${filePath}`);
        return new Response('Not a file', { status: 404 });
      }
      
      console.log(`Found file: ${filePath}, size: ${stats.size} bytes`);
      
      // Read file
      const fileBuffer = await fs.readFile(filePath);
      
      // Determine content type
      let contentType = 'application/octet-stream';
      if (decodedFilename.endsWith('.docx')) {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (decodedFilename.endsWith('.pdf')) {
        contentType = 'application/pdf';
      }
      
      console.log(`Serving file: ${decodedFilename}, content-type: ${contentType}`);
      
      // Return the file
      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${decodedFilename}"`,
          'Content-Length': stats.size.toString(),
        },
      });
    } catch (error) {
      console.error(`Error serving file ${filePath}:`, error);
      return new Response('File not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error in download handler:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 