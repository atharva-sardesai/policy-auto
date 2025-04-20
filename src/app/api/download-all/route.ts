import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import archiver from 'archiver'

// Ensure this route is not statically optimized
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const docsDir = path.join(process.cwd(), 'generated_docs')
    
    // Check if directory exists
    try {
      await fs.access(docsDir)
    } catch {
      return new NextResponse('No documents found', { status: 404 })
    }

    // Get list of files
    const files = await fs.readdir(docsDir)
    if (files.length === 0) {
      return new NextResponse('No documents found', { status: 404 })
    }

    // Create a zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    })

    // Add each file to the archive
    for (const file of files) {
      const filePath = path.join(docsDir, file)
      archive.file(filePath, { name: file })
    }

    // Finalize the archive
    archive.finalize()

    // Create a response with the archive
    const chunks: Buffer[] = []
    archive.on('data', (chunk: Buffer) => chunks.push(chunk))
    
    await new Promise((resolve, reject) => {
      archive.on('end', resolve)
      archive.on('error', reject)
    })

    const zipBuffer = Buffer.concat(chunks)

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="documents.zip"',
      },
    })
  } catch (error) {
    console.error('Error creating zip archive:', error)
    return new NextResponse('Failed to create zip archive', { status: 500 })
  }
} 