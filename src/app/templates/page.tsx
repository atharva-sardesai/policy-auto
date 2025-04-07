"use client"

import type React from "react"

import { useState } from "react"
import { FileText, Trash2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for templates
const mockTemplates = [
  { id: "1", name: "Privacy Policy", type: "privacy", updatedAt: "2023-11-01" },
  { id: "2", name: "Terms of Service", type: "terms", updatedAt: "2023-10-28" },
  { id: "3", name: "Cookie Policy", type: "cookie", updatedAt: "2023-10-15" },
  { id: "4", name: "GDPR Compliance", type: "gdpr", updatedAt: "2023-09-22" },
  { id: "5", name: "Security Policy", type: "security", updatedAt: "2023-09-10" },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(mockTemplates)
  const [isUploading, setIsUploading] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ name: "", type: "" })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, you would upload the file to your storage solution
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true)

      // Simulate upload delay
      setTimeout(() => {
        setIsUploading(false)
      }, 1500)
    }
  }

  const handleAddTemplate = () => {
    // In a real app, you would save the template to your database
    const newId = (templates.length + 1).toString()
    const today = new Date().toISOString().split("T")[0]

    setTemplates([
      ...templates,
      {
        id: newId,
        name: newTemplate.name,
        type: newTemplate.type,
        updatedAt: today,
      },
    ])

    setNewTemplate({ name: "", type: "" })
  }

  const handleDeleteTemplate = (id: string) => {
    // In a real app, you would delete the template from your database
    setTemplates(templates.filter((template) => template.id !== id))
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Templates</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Template</DialogTitle>
              <DialogDescription>
                Upload a DOCX template with placeholder text for generating policy documents.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Privacy Policy Template"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Template Type</Label>
                <Input
                  id="type"
                  value={newTemplate.type}
                  onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
                  placeholder="e.g., privacy"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">Template File (DOCX)</Label>
                <Input id="file" type="file" accept=".docx" onChange={handleFileChange} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTemplate} disabled={isUploading || !newTemplate.name || !newTemplate.type}>
                {isUploading ? "Uploading..." : "Add Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Templates</CardTitle>
          <CardDescription>View and manage your policy document templates.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      {template.name}
                    </div>
                  </TableCell>
                  <TableCell>{template.type}</TableCell>
                  <TableCell>{template.updatedAt}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(template.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

