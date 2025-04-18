"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Download, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Company {
  name: string;
  address: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  status: string;
  company: Company;
  content: string;
}

// Mock document data
const mockDocumentDetails: Record<string, Document> = {
  doc1: {
    id: "doc1",
    name: "Acme Inc. Privacy Policy",
    type: "privacy",
    createdAt: "2023-11-05",
    status: "completed",
    company: {
      name: "Acme Inc.",
      address: "123 Business St, San Francisco, CA 94105",
      contactName: "John Smith",
      contactEmail: "john@acmeinc.com",
      contactPhone: "(555) 123-4567",
    },
    content: `
      <h1>Privacy Policy for Acme Inc.</h1>
      <p>Last updated: November 5, 2023</p>
      <h2>1. Introduction</h2>
      <p>Acme Inc. (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>
      <h2>2. Information We Collect</h2>
      <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
      <ul>
        <li>Personal Data: Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register with us or when you choose to participate in various activities related to our website.</li>
        <li>Derivative Data: Information our servers automatically collect when you access our website, such as your IP address, browser type, operating system, access times, and the pages you have viewed.</li>
      </ul>
      <h2>3. Contact Information</h2>
      <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
      <p>Acme Inc.<br>123 Business St<br>San Francisco, CA 94105</p>
      <p>Contact: John Smith<br>Email: john@acmeinc.com<br>Phone: (555) 123-4567</p>
    `,
  },
  // Add more mock documents as needed
}

export default function DocumentDetailPage() {
  const params = useParams()
  const documentId = params.id as string
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch the document from your API
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setDocument(mockDocumentDetails[documentId as keyof typeof mockDocumentDetails])
      setLoading(false)
    }, 500)
  }, [documentId])

  if (loading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading document...</p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Document Not Found</h2>
              <p className="text-muted-foreground mt-2">
                The document you&apos;re looking for doesn&apos;t exist or has been deleted.
              </p>
              <Link href="/documents">
                <Button className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Documents
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/documents">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{document.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download DOCX
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Document Type</dt>
                <dd className="mt-1">{document.type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                <dd className="mt-1">{document.createdAt}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                    {document.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Company</dt>
                <dd className="mt-1">{document.company.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Contact</dt>
                <dd className="mt-1">{document.company.contactName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="mt-1">{document.company.contactEmail}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Preview</CardTitle>
            <CardDescription>Preview your generated policy document.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview">
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="placeholders">Placeholders</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="border rounded-md p-4">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: document.content }} />
              </TabsContent>
              <TabsContent value="placeholders" className="border rounded-md p-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Available Placeholders</h3>
                  <p className="text-muted-foreground">These placeholders were replaced in your document:</p>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="font-mono text-sm">{"{{company_name}}"}</span>
                      <span>{document.company.name}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-mono text-sm">{"{{company_address}}"}</span>
                      <span>{document.company.address}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-mono text-sm">{"{{contact_name}}"}</span>
                      <span>{document.company.contactName}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-mono text-sm">{"{{contact_email}}"}</span>
                      <span>{document.company.contactEmail}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-mono text-sm">{"{{contact_phone}}"}</span>
                      <span>{document.company.contactPhone}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-mono text-sm">{"{{current_date}}"}</span>
                      <span>{document.createdAt}</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

