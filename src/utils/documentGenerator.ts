import { promises as fs } from 'fs';
import * as fs_sync from 'fs';
import path from 'path';
import { createReport } from 'docx-templates';
import { ImageRun } from 'docx';

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

// Helper function to create an ImageRun with proper options for the logo
function createLogoImageRun(logoPath?: string): ImageRun | null {
  if (!logoPath) {
    console.log('No logo path provided');
    return null;
  }
  
  try {
    // Check if file exists
    if (!fs_sync.existsSync(logoPath)) {
      console.error(`Logo file does not exist: ${logoPath}`);
      return null;
    }
    
    // Debug info for logo file
    console.log('Logo debug info:');
    console.log(`- Logo path exists: ${fs_sync.existsSync(logoPath)}`);
    try {
      const stats = fs_sync.statSync(logoPath);
      console.log(`- Logo file size: ${stats.size} bytes`);
      console.log(`- Logo file permissions: ${stats.mode}`);
    } catch (error: any) {
      console.error(`- Error accessing logo file: ${error.message}`);
    }
    
    // Read the logo file synchronously
    const logoBuffer = fs_sync.readFileSync(logoPath);
    console.log(`Logo file read successfully. Size: ${logoBuffer.length} bytes`);
    
    // Determine image type from file extension
    const imageType = path.extname(logoPath).toLowerCase().replace('.', '');
    console.log(`- Detected image type: ${imageType}`);
    
    // Validate image type
    const validImageTypes = ['jpg', 'png', 'gif', 'bmp', 'svg'] as const;
    type ValidImageType = typeof validImageTypes[number];
    const validatedType: ValidImageType = validImageTypes.includes(imageType as ValidImageType) ? (imageType as ValidImageType) : 'png';
    console.log(`- Using image type: ${validatedType}`);
    
    // Create the ImageRun with appropriate options based on image type
    const imageOptions: any = {
      data: logoBuffer,
      transformation: {
        width: 200,
        height: 100
      },
      type: validatedType
    };

    // Add fallback for SVG images
    if (validatedType === 'svg') {
      imageOptions.fallback = {
        type: 'png',
        data: logoBuffer
      };
    }
    
    return new ImageRun(imageOptions);
  } catch (error: any) {
    console.error(`Error creating logo ImageRun: ${error.message}`);
    return null;
  }
} 