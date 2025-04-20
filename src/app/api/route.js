import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  try {
    const docsDir = path.join(process.cwd(), 'generated_docs');
    const files = await fs.readdir(docsDir);
    
    return NextResponse.json(files);
  } catch (error) {
    console.error('Error listing documents:', error);
    return NextResponse.json(
      { error: 'Failed to list documents' },
      { status: 500 }
    );
  }
} 