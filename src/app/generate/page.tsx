"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

// Define the Template type
interface Template {
  id: string;
  name: string;
}

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const router = useRouter();

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError('Failed to load templates. Please try again later.');
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTemplates(new Set(templates.map(t => t.id)));
    } else {
      setSelectedTemplates(new Set());
    }
  };

  const handleTemplateSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedTemplates);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedTemplates(newSelected);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.append('templates', JSON.stringify(Array.from(selectedTemplates)));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate documents');
      }

      const data = await response.json();
      if (data.success) {
        router.push('/documents');
      } else {
        setError(data.error || 'Failed to generate documents');
      }
    } catch (err) {
      setError('An error occurred while generating documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Generate Documents</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              required
              minLength={2}
              placeholder="Enter company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAddress">Company Address</Label>
            <Input
              id="companyAddress"
              name="companyAddress"
              required
              minLength={5}
              placeholder="Enter company address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              id="contactName"
              name="contactName"
              required
              minLength={2}
              placeholder="Enter contact name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              required
              placeholder="Enter contact email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              required
              minLength={10}
              placeholder="Enter contact phone"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="policyType">Policy Type</Label>
            <Input
              id="policyType"
              name="policyType"
              required
              placeholder="Enter policy type"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Input
              id="additionalInfo"
              name="additionalInfo"
              placeholder="Enter additional information (optional)"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="selectAll"
              checked={selectedTemplates.size === templates.length}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="selectAll">Select All Templates</Label>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center space-x-2">
                <Checkbox
                  id={template.id}
                  checked={selectedTemplates.has(template.id)}
                  onCheckedChange={(checked) => handleTemplateSelect(template.id, checked as boolean)}
                />
                <Label htmlFor={template.id}>{template.name}</Label>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Documents'
          )}
        </Button>
      </form>
    </div>
  );
}

