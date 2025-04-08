import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync, readdirSync } from 'fs'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const file = url.searchParams.get('file')
    
    if (!file) {
      return new NextResponse('File parameter is required', { status: 400 })
    }
    
    // Prevent directory traversal attacks
    if (file.includes('..') || file.startsWith('/') || file.startsWith('\\')) {
      return new NextResponse('Invalid file path', { status: 400 })
    }
    
    // Normalize the file path by replacing backslashes with forward slashes
    const normalizedFile = file.replace(/\\/g, '/')
    console.log(`Attempting to download file: ${normalizedFile}`)
    
    // Build the file path
    const filePath = join(process.cwd(), 'generated_docs', normalizedFile)
    console.log(`Full file path: ${filePath}`)
    
    // Check if the file exists
    if (!existsSync(filePath)) {
      console.error(`File not found: ${filePath}`)
      
      // Try to find the file in the generated_docs directory
      const docsDir = join(process.cwd(), 'generated_docs')
      try {
        const files = readdirSync(docsDir)
        
        // Look for a file that ends with the requested file name
        const requestedFileName = normalizedFile.split('/').pop() || ''
        if (requestedFileName) {
          const matchingFile = files.find((f: string) => f.endsWith(requestedFileName))
          
          if (matchingFile) {
            const alternativeFilePath = join(docsDir, matchingFile)
            console.log(`Found alternative file path: ${alternativeFilePath}`)
            
            if (existsSync(alternativeFilePath)) {
              // Read and return the alternative file
              const fileContent = await readFile(alternativeFilePath)
              return new NextResponse(fileContent, {
                headers: {
                  'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'Content-Disposition': `attachment; filename="${matchingFile}"`,
                },
              })
            }
          }
        }
      } catch (lookupErr) {
        console.error('Error looking up alternative file:', lookupErr)
      }
      
      return new NextResponse('File not found', { status: 404 })
    }
    
    // Read the file
    const fileContent = await readFile(filePath)
    
    // Get the filename from the path
    const fileName = file.split(/[/\\]/).pop() || file
    
    // Return the file with appropriate headers
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Error handling download request:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 