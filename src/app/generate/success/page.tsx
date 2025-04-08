"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { FileText, Download, ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Loading component for Suspense
function LoadingGeneratedFiles() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Loading Documents</CardTitle>
          <CardDescription>
            Please wait while we load your generated documents...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Content component that uses useSearchParams
function SuccessPageContent() {
  const searchParams = useSearchParams()
  const [files, setFiles] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  useEffect(() => {
    try {
      const filesParam = searchParams.get("files")
      setDebugInfo(`Raw files param: ${filesParam}`)
      
      if (filesParam) {
        try {
          const decodedParam = decodeURIComponent(filesParam)
          let parsedFiles;
          
          try {
            parsedFiles = JSON.parse(decodedParam)
          } catch (parseErr) {
            console.error("Error parsing JSON:", parseErr)
            // If it fails to parse as JSON, it might be a single file path
            if (typeof decodedParam === 'string' && decodedParam.includes('generated_docs')) {
              parsedFiles = [decodedParam]
            } else {
              throw parseErr
            }
          }
          
          if (Array.isArray(parsedFiles)) {
            // Filter out any empty strings or null values
            const validFiles = parsedFiles.filter(file => 
              typeof file === 'string' && file.trim().length > 0
            )
            
            setFiles(validFiles)
            if (validFiles.length === 0) {
              setError("No documents were generated")
              setDebugInfo(`No valid files found in: ${JSON.stringify(parsedFiles)}`)
            }
          } else if (typeof parsedFiles === 'string' && parsedFiles.trim()) {
            // Handle case where a single string is returned
            setFiles([parsedFiles])
          } else {
            setFiles([])
            setError("Invalid files format")
            setDebugInfo(`Unexpected format: ${JSON.stringify(parsedFiles)}`)
          }
        } catch (parseErr) {
          console.error("Error parsing files data:", parseErr)
          setError("Error parsing files data")
          setDebugInfo(`Parse error: ${String(parseErr)}, Raw data: ${filesParam}`)
        }
      } else {
        setError("No files information found")
      }
    } catch (err) {
      console.error("Error processing files data:", err)
      setError(`Error processing files: ${String(err)}`)
    }
  }, [searchParams])

  // Helper function to get filename from path
  const getFileName = (path: string) => {
    if (!path) return "Unknown file";
    
    try {
      // Handle both Windows and Unix paths
      const filename = path.split(/[/\\]/).pop() || path;
      return filename;
    } catch (error) {
      console.error("Error extracting filename:", error, path);
      return path;
    }
  }

  // Helper function to get file download URL
  const getFileDownloadUrl = (filePath: string) => {
    try {
      if (!filePath) return "";
      
      // Look for the generated_docs part of the path
      let relativePath = "";
      
      if (filePath.includes('generated_docs')) {
        const parts = filePath.split('generated_docs');
        // Take everything after 'generated_docs/'
        if (parts.length > 1) {
          relativePath = parts[1].replace(/^[/\\]/, ''); // Remove leading slash or backslash
        } else {
          relativePath = filePath;
        }
      } else {
        // Just use the filename as fallback
        relativePath = getFileName(filePath);
      }
      
      return `/api/download?file=${encodeURIComponent(relativePath)}`;
    } catch (error) {
      console.error("Error generating download URL:", error, filePath);
      return "";
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Policy Documents Generated</CardTitle>
          <CardDescription>
            Your policy documents have been successfully generated. You can download them below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}. Please try generating your documents again.
              </AlertDescription>
              {debugInfo && (
                <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                  <details>
                    <summary>Debug Information</summary>
                    <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">{debugInfo}</pre>
                  </details>
                </div>
              )}
            </Alert>
          ) : files.length === 0 ? (
            <Alert>
              <AlertTitle>No Documents</AlertTitle>
              <AlertDescription>
                No policy documents were generated. Please try again with different settings.
              </AlertDescription>
              {debugInfo && (
                <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                  <details>
                    <summary>Debug Information</summary>
                    <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">{debugInfo}</pre>
                  </details>
                </div>
              )}
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium">{getFileName(file)}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <a href={getFileDownloadUrl(file)} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="default" 
                  asChild
                >
                  <Link href="/">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
                
                {files.length > 1 && (
                  <Button 
                    variant="outline" 
                    size="default"
                    asChild
                  >
                    <a 
                      href={`/api/download-all?files=${encodeURIComponent(JSON.stringify(files))}`}
                      download="policy_documents.zip"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download All as ZIP
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Main component with Suspense boundary
export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingGeneratedFiles />}>
      <SuccessPageContent />
    </Suspense>
  )
}

// This export ensures Next.js treats this as a dynamic route
export const dynamic = 'force-dynamic'; 