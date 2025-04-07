"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Download, Eye, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for generated documents
const mockDocuments = [
  {
    id: "doc1",
    name: "Acme Inc. Privacy Policy",
    type: "privacy",
    createdAt: "2023-11-05",
    status: "completed",
  },
  {
    id: "doc2",
    name: "TechCorp Terms of Service",
    type: "terms",
    createdAt: "2023-11-03",
    status: "completed",
  },
  {
    id: "doc3",
    name: "Global Solutions GDPR Policy",
    type: "gdpr",
    createdAt: "2023-10-28",
    status: "completed",
  },
  {
    id: "doc4",
    name: "Startup Inc. Security Policy",
    type: "security",
    createdAt: "2023-10-25",
    status: "completed",
  },
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(mockDocuments)

  const handleDeleteDocument = (id: string) => {
    // In a real app, you would delete the document from your database
    setDocuments(documents.filter((doc) => doc.id !== id))
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Generated Documents</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>View and manage your generated policy documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      {document.name}
                    </div>
                  </TableCell>
                  <TableCell>{document.type}</TableCell>
                  <TableCell>{document.createdAt}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                      {document.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/documents/${document.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(document.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

