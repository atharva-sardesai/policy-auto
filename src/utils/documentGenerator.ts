import { ImageRun } from 'docx';
import { promises as fs } from 'fs';
import fs_sync from 'fs';
import path from 'path';
import createReport from 'docx-templates';

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
  logoPath
}: GenerateDocumentOptions): Promise<string> {
  console.log(`Generating document from template: ${templatePath}`);
  console.log(`Company: ${companyName}, Owner: ${ownerName}`);
  console.log(`Logo path: ${logoPath || 'None'}`);
  console.log(`Output directory: ${outputDir}`);
  
  try {
    // Check that template file exists
    if (!fs_sync.existsSync(templatePath)) {
      throw new Error(`Template file does not exist: ${templatePath}`);
    }
    
    // Generate a unique filename based on the template
    const templateName = path.basename(templatePath, path.extname(templatePath));
    const sanitizedCompanyName = companyName.replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFilename = `${sanitizedCompanyName}_${templateName}_${timestamp}.docx`;
    const outputPath = path.join(outputDir, outputFilename);
    
    // For DOCX files - process the template
    if (templatePath.toLowerCase().endsWith('.docx')) {
      try {
        // Read the template file
        const templateContent = fs_sync.readFileSync(templatePath);
        
        // Create image data objects if logo is provided
        let imageData = null;
        let headerImageData = null;
        
        if (logoPath && fs_sync.existsSync(logoPath)) {
          const imageBuffer = fs_sync.readFileSync(logoPath);
          const imageType = path.extname(logoPath).toLowerCase();
          
          // Create main logo image data
          imageData = {
            data: imageBuffer,
            width: 6, // width in cm
            height: 3, // height in cm
            extension: imageType
          };
          
          // Create header logo image data (smaller version)
          headerImageData = {
            data: imageBuffer,
            width: 2, // width in cm
            height: 1, // height in cm
            extension: imageType
          };
          
          console.log('Logo image data created successfully');
        }
        
        // Set the data for the template
        const currentDate = new Date().toLocaleDateString();
        
        // Prepare data for the template
        const data = {
          Company_Name: companyName,
          CompanyName: companyName,
          Owner_Name: ownerName,
          OwnerName: ownerName,
          Generated_Date: currentDate,
          current_date: currentDate,
          Company_Logo: imageData,
          Header_Logo: headerImageData
        };
        
        // Additional JavaScript context for image processing
        const additionalJsContext = {
          Company_Logo: imageData,
          Header_Logo: headerImageData,
          getImage: async () => imageData
        };
        
        // Generate the report using docx-templates
        const buffer = await createReport({
          template: templateContent,
          data,
          cmdDelimiter: ['{', '}'],
          processLineBreaks: true,
          noSandbox: false,
          rejectNullish: false,
          failFast: false,
          additionalJsContext,
          errorHandler: (err, command_code) => {
            console.error(`Error in template command: ${command_code}`, err);
            return `[Error: ${err.message}]`;
          }
        });
        
        // Write the output to file
        await fs.writeFile(outputPath, buffer);
        
        console.log(`Successfully generated document: ${outputPath}`);
        return outputPath;
      } catch (docxError: any) {
        console.error(`Error processing DOCX template: ${docxError.message}`);
        if (Array.isArray(docxError)) {
          console.error('Template errors found:');
          docxError.forEach((err, index) => {
            console.error(`Error ${index + 1}:`, err.message);
          });
        }
        throw docxError;
      }
    } else if (templatePath.toLowerCase().endsWith('.txt')) {
      // For text files - simple text replacement
      let content = await fs.readFile(templatePath, 'utf8');
      
      // Replace placeholders
      content = content.replace(/\{Company_Name\}/g, companyName);
      content = content.replace(/\{CompanyName\}/g, companyName);
      content = content.replace(/\{Owner_Name\}/g, ownerName);
      content = content.replace(/\{OwnerName\}/g, ownerName);
      content = content.replace(/\{Generated_Date\}/g, new Date().toLocaleDateString());
      content = content.replace(/\{current_date\}/g, new Date().toLocaleDateString());
      
      // Write to file
      await fs.writeFile(outputPath, content);
      
      console.log(`Successfully generated text document: ${outputPath}`);
      return outputPath;
    } else {
      // Unsupported file type - just copy
      await fs.copyFile(templatePath, outputPath);
      console.log(`Unsupported file type, copied template to: ${outputPath}`);
      return outputPath;
    }
  } catch (error: any) {
    console.error(`Error generating document: ${error.message}`);
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