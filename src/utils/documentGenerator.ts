import { promises as fs } from 'fs';
import path from 'path';
import { createReport } from 'docx-templates';

interface GenerateDocumentOptions {
  templatePath: string;
  outputDir: string;
  companyName: string;
  ownerName: string;
  logoPath?: string;
}

// Main document generation function
export async function generateDocument({
  templatePath,
  outputDir,
  companyName,
  ownerName,
  logoPath,
}: GenerateDocumentOptions): Promise<string> {
  console.log('Generating document with options:', {
    templatePath,
    outputDir,
    companyName,
    ownerName,
    logoPath,
  });

  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Read template file
    const template = await fs.readFile(templatePath);

    // Prepare data for template
    const data = {
      companyName,
      ownerName,
      logoPath,
    };

    // Generate document
    const buffer = await createReport({
      template,
      data,
      cmdDelimiter: ['{{', '}}'],
    });

    // Generate output filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFilename = `${companyName}-${timestamp}.docx`;
    const outputPath = path.join(outputDir, outputFilename);

    // Write document to file
    await fs.writeFile(outputPath, buffer);

    return outputPath;
  } catch (error: unknown) {
    console.error('Error generating document:', error);
    throw error;
  }
} 