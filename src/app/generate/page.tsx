"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  companyAddress: z.string().min(5, {
    message: "Company address must be at least 5 characters.",
  }),
  contactName: z.string().min(2, {
    message: "Contact name must be at least 2 characters.",
  }),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  contactPhone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  policyType: z.string({
    required_error: "Please select a policy type.",
  }),
  additionalInfo: z.string().optional(),
})

// Define the Template type
interface Template {
  id: string;
  name: string;
}

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(true);
  const [templateSelection, setTemplateSelection] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const router = useRouter();
  
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates');
        
        // Handle non-OK responses
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        // Try to read as text first, then parse
        const text = await response.text();
        
        try {
          const data = JSON.parse(text);
          setTemplates(data.templates || []);
          
          // Initialize selection state with all templates selected by default
          const initialSelection: Record<string, boolean> = {};
          data.templates.forEach((template: Template) => {
            initialSelection[template.id] = true;
          });
          setTemplateSelection(initialSelection);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          console.error('Raw response:', text);
          throw new Error('Invalid JSON response from server');
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        setError('Failed to load templates. Please refresh the page or try again later.');
      }
    };
    
    fetchTemplates();
  }, []);
  
  // Get the selected templates (filter by those that are selected)
  const selectedTemplates = Object.entries(templateSelection)
    .filter(([_, isSelected]) => isSelected)
    .map(([id]) => id);
  
  // Handle select all toggle
  const handleSelectAll = (checked: boolean | string) => {
    const isChecked = checked === true;
    setSelectAllChecked(isChecked);
    
    // Update all individual checkboxes
    const newSelection = { ...templateSelection };
    templates.forEach(template => {
      newSelection[template.id] = isChecked;
    });
    setTemplateSelection(newSelection);
  };
  
  // Handle individual template selection
  const handleTemplateSelect = (id: string, checked: boolean | string) => {
    const isSelected = checked === true;
    const newSelection = { ...templateSelection, [id]: isSelected };
    setTemplateSelection(newSelection);
    
    // Check if all are selected/deselected to update the "Select All" checkbox
    const allSelected = templates.every(template => newSelection[template.id]);
    setSelectAllChecked(allSelected);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedFiles([]);
    
    try {
      const formData = new FormData(event.currentTarget);
      
      // Get the selected templates from state
      const selectedTemplates = Object.entries(templateSelection)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => id);
      
      if (selectedTemplates.length === 0) {
        setError('Please select at least one template');
        setLoading(false);
        return;
      }
      
      // Add the selected templates as a JSON string
      formData.append('templates', JSON.stringify(selectedTemplates));
      
      console.log('Submitting form with data:');
      console.log('- Company:', formData.get('companyName'));
      console.log('- Owner:', formData.get('ownerName'));
      console.log('- Logo:', formData.get('logo'));
      console.log('- Templates:', formData.get('templates'));
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });
      
      // First try to parse as JSON
      let responseText = '';
      try {
        responseText = await response.text();
        const data = JSON.parse(responseText);
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate documents');
        }
        
        if (data.success) {
          console.log("Generated files from API response:", data.documents || data.generatedDocs || []);
          setGeneratedFiles(data.documents || data.generatedDocs || []);
          setMessage(data.message || `Generated ${(data.documents || data.generatedDocs || []).length} document(s) successfully`);
          
          // Check for any failed templates
          if (data.failedTemplates && data.failedTemplates.length > 0) {
            setError(`Warning: ${data.failedTemplates.length} template(s) could not be generated. ${data.failedTemplates.map((t: any) => `${t.id}: ${t.error}`).join(', ')}`);
          }
        } else {
          throw new Error(data.error || 'Unknown error occurred');
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        console.error('Raw response:', responseText);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}...`);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Generate Policy Documents</h1>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Success Message */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{message}</p>
        </div>
      )}
      
      {/* Document Generation Form */}
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input 
            id="companyName"
            name="companyName"
            placeholder="Enter your company name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ownerName">Owner Name</Label>
          <Input 
            id="ownerName"
            name="ownerName"
            placeholder="Enter owner's name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo">Company Logo (Optional)</Label>
          <Input 
            id="logo"
            name="logo"
            type="file"
            accept="image/*"
          />
          <p className="text-sm text-muted-foreground">
            Upload your company logo (PNG or JPEG format recommended)
          </p>
        </div>

        <div className="space-y-3">
          <Label>Select Templates to Generate</Label>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading templates...</p>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No templates available. Please add templates first.</p>
          ) : (
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all"
                  checked={selectAllChecked}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-medium">Select All Templates</Label>
              </div>
              
              <div className="grid gap-2 pl-6 mt-2">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`template-${template.id}`}
                      checked={templateSelection[template.id] || false}
                      onCheckedChange={(checked) => handleTemplateSelect(template.id, checked)}
                    />
                    <Label 
                      htmlFor={`template-${template.id}`}
                      className="font-normal"
                      title={template.id} // Show the exact file name as a tooltip
                    >
                      {template.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Generated Files List */}
        {generatedFiles.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Generated Documents</h2>
            <ul className="space-y-2">
              {generatedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between border-b pb-2">
                  <span className="text-blue-600">{file}</span>
                  <a 
                    href={`/api/download?file=${encodeURIComponent(file)}`}
                    download={file}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Documents"
          )}
        </Button>
      </form>
      
      <Alert className="mt-4 mb-6">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Template Format</AlertTitle>
        <AlertDescription className="text-sm">
          <p>Your template should include the following placeholders:</p>
          <ul className="list-disc pl-6 mt-2">
            <li><strong>{`{Company_Name}`}</strong> - Will be replaced with the company name</li>
            <li><strong>{`{Owner_Name}`}</strong> - Will be replaced with the owner name</li>
            <li><strong>{`{Generated_Date}`}</strong> - Will be replaced with the current date</li>
          </ul>
          
          <p className="mt-3"><strong>Logo Insertion:</strong></p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              To insert a logo within your template, use any of these placeholders:
              <ul className="list-disc pl-6 mt-1">
                <li><strong>{`{Company_Logo}`}</strong> - Standard size logo (150x60px)</li>
                <li><strong>{`{CompanyLogo}`}</strong> - Alternative name, same size</li>
                <li><strong>{`{Logo}`}</strong> - Simple name, same size</li>
                <li><strong>{`{insertSmallLogo()}`}</strong> - For a smaller logo (100x40px)</li>
              </ul>
            </li>
            <li>Place these anywhere in your template where you want the logo to appear</li>
          </ul>
          
          <p className="mt-3 text-amber-600 font-medium">
            Important: If your template uses complex formatting or advanced features of Word,
            the system will try to preserve as much as possible while still replacing placeholders.
          </p>
        </AlertDescription>
      </Alert>
    </main>
  );
}

