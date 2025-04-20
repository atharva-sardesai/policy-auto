import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Ensure this route is not statically optimized
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const file = searchParams.get('file')
    
    if (!file) {
      return new NextResponse('File parameter is required', { status: 400 })
    }
    
    // Validate file path to prevent directory traversal
    if (file.includes('..') || file.includes('/') || file.includes('\\')) {
      return new NextResponse('Invalid file path', { status: 400 })
    }
    
    // Construct safe file path
    const filePath = path.join(process.cwd(), 'generated_docs', file)
    
    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      // Try to find the file in the generated_docs directory
      const docsDir = path.join(process.cwd(), 'generated_docs')
      const files = await fs.readdir(docsDir)
      const matchingFile = files.find(f => f.toLowerCase() === file.toLowerCase())
      
      if (!matchingFile) {
        return new NextResponse('File not found', { status: 404 })
      }
      
      // Use the found file
      const foundFilePath = path.join(docsDir, matchingFile)
      const content = await fs.readFile(foundFilePath)
      
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${matchingFile}"`,
        },
      })
    }
    
    // Read and return the file
    const content = await fs.readFile(filePath)
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${file}"`,
      },
    })
  } catch (error) {
    console.error('Error downloading file:', error)
    return new NextResponse('Failed to download file', { status: 500 })
  }
} 