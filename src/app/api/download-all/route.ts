import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import * as JSZip from 'jszip'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const filesParam = url.searchParams.get('files')
    
    if (!filesParam) {
      return new NextResponse('Files parameter is required', { status: 400 })
    }
    
    // Parse the files array
    let files: string[]
    try {
      files = JSON.parse(decodeURIComponent(filesParam))
      if (!Array.isArray(files)) {
        throw new Error('Files must be an array')
      }
    } catch (error) {
      return new NextResponse('Invalid files parameter', { status: 400 })
    }
    
    // Create a new ZIP archive
    const zip = new JSZip()
    
    // Add each file to the ZIP
    for (const filePath of files) {
      // Extract the filename from the path
      const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'unknown.docx'
      
      // Make sure we're only accessing files in the generated_policies directory
      const relativePath = filePath.split('generated_policies/').pop()
      if (!relativePath) {
        console.warn(`Skipping file with invalid path: ${filePath}`)
        continue
      }
      
      // Prevent directory traversal attacks
      if (relativePath.includes('..') || relativePath.startsWith('/') || relativePath.startsWith('\\')) {
        console.warn(`Skipping file with suspicious path: ${relativePath}`)
        continue
      }
      
      // Build the absolute file path
      const absolutePath = join(process.cwd(), 'generated_policies', relativePath)
      
      // Check if the file exists
      if (!existsSync(absolutePath)) {
        console.warn(`File not found: ${absolutePath}`)
        continue
      }
      
      // Read the file and add it to the ZIP
      try {
        const fileContent = await readFile(absolutePath)
        zip.file(fileName, fileContent)
      } catch (err) {
        console.error(`Error adding file to ZIP: ${absolutePath}`, err)
      }
    }
    
    // Generate the ZIP content
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' })
    
    // Return the ZIP file
    return new NextResponse(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="policy_documents.zip"',
      },
    })
  } catch (error) {
    console.error('Error generating ZIP file:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 