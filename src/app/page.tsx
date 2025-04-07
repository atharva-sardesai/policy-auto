import Link from "next/link"
import { FileText, Upload, Database } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <FileText className="h-6 w-6" />
                <span className="font-bold">PolicyGen</span>
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
              <Link
                href="/templates"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Templates
              </Link>
              <Link
                href="/documents"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Documents
              </Link>
              <Link
                href="/settings"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full">
        <section className="w-full bg-muted/40 py-12 md:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Generate Custom Policy Documents
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Create professional policy documents in seconds by filling out a simple form.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/generate">
                  <Button size="lg">Create New Document</Button>
                </Link>
                <Link href="/templates">
                  <Button variant="outline" size="lg">
                    Manage Templates
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <Upload className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">Template Management</CardTitle>
                  <CardDescription>Upload and manage your DOCX policy templates with placeholder text.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">Document Generation</CardTitle>
                  <CardDescription>
                    Fill out a form to automatically generate customized policy documents.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <Database className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">API Integration</CardTitle>
                  <CardDescription>
                    Use our REST API to automate policy generation from your applications.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-muted/40">
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} PolicyGen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

