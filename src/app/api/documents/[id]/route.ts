import { NextRequest, NextResponse } from "next/server"

// Mock document data
const mockDocumentDetails = {
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
      <p>Acme Inc. ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>
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

// Updated function signature to match Next.js 15.2.4 requirements for dynamic routes
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const documentId = context.params.id

    // In a real app, you would fetch the document from your database
    const document = mockDocumentDetails[documentId as keyof typeof mockDocumentDetails]

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error("Error fetching document:", error)
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
  }
}

