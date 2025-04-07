import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real app, you would fetch documents from your database
    // For this example, we'll return mock data

    const documents = [
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

    return NextResponse.json({ documents })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

