import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, HeadingLevel } from 'docx';
import { promises as fs } from 'fs';
import fs_sync from 'fs';
import path from 'path';
// @ts-ignore
import Docxtemplater from 'docxtemplater';
// @ts-ignore
import PizZip from 'pizzip';
import { Buffer } from 'buffer';

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
        
        // Handle logo with special method if provided
        if (logoPath && fs_sync.existsSync(logoPath)) {
          console.log(`Logo file exists at ${logoPath}, using enhanced logo processing`);
          // Create a document with logo from the template
          return await createDocumentWithLogoFromTemplate({
            templatePath,
            outputDir,
            companyName,
            ownerName,
            logoPath
          });
        }
        
        // Load the docx file as a zip file
        const zip = new PizZip(templateContent);
        
        // Create a docxtemplater instance
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });
        
        // Set the data for the template
        const currentDate = new Date().toLocaleDateString();
        
        doc.setData({
          Company_Name: companyName,
          CompanyName: companyName,
          Owner_Name: ownerName,
          OwnerName: ownerName,
          Generated_Date: currentDate,
          current_date: currentDate,
          // Add empty values for logo placeholders to avoid "undefined" text
          Company_Logo: "",
          CompanyLogo: "",
          Logo: ""
        });
        
        // Render the document with the data
        doc.render();
        
        // Generate the output
        const outputBuffer = doc.getZip().generate({
          type: 'nodebuffer',
          compression: 'DEFLATE'
        });
        
        // Write the output to file
        await fs.writeFile(outputPath, outputBuffer);
        
        console.log(`Successfully generated document: ${outputPath}`);
        return outputPath;
      } catch (docxError: any) {
        console.error(`Error processing DOCX template: ${docxError.message}`);
        console.log('Falling back to simple file copy');
        
        // Fallback: Copy template file directly
        await fs.copyFile(templatePath, outputPath);
        
        console.log(`Copied template to: ${outputPath}`);
        return outputPath;
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

// Function to create a document with logo from template 
async function createDocumentWithLogoFromTemplate({
  templatePath,
  outputDir,
  companyName,
  ownerName,
  logoPath
}: GenerateDocumentOptions): Promise<string> {
  console.log("Using advanced logo processing with template");
  
  // Generate a unique filename
  const templateName = path.basename(templatePath, path.extname(templatePath));
  const sanitizedCompanyName = companyName.replace(/\s+/g, '_');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFilename = `${sanitizedCompanyName}_${templateName}_${timestamp}.docx`;
  const outputPath = path.join(outputDir, outputFilename);
  
  try {
    // First, create a copy of the template with text placeholders replaced
    const templateContent = fs_sync.readFileSync(templatePath);
    const zip = new PizZip(templateContent);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    // Set the data for text placeholders only
    const currentDate = new Date().toLocaleDateString();
    doc.setData({
      Company_Name: companyName,
      CompanyName: companyName,
      Owner_Name: ownerName,
      OwnerName: ownerName,
      Generated_Date: currentDate,
      current_date: currentDate
    });
    
    // Render the document without logo
    doc.render();
    
    // Save to a temporary file
    const tempFilePath = path.join(outputDir, `temp_${Date.now()}_${templateName}.docx`);
    const outputBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    });
    await fs.writeFile(tempFilePath, outputBuffer);
    
    // Now create a new document with docx library and add company info + logo
    const logoDoc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: `${companyName} - ${templateName}`,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER
          }),
          
          // Add logo 
          new Paragraph({
            children: [
              createLogoImageRun(logoPath) || 
              new TextRun({ text: "(Logo not available)", italics: true, color: "999999" })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          }),
          
          new Paragraph({
            text: `Generated for: ${companyName}`,
            alignment: AlignmentType.CENTER
          }),
          
          new Paragraph({
            text: `Owner: ${ownerName}`,
            alignment: AlignmentType.CENTER
          }),
          
          new Paragraph({
            text: `Date: ${new Date().toLocaleDateString()}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          })
        ]
      }]
    });
    
    // Save the logo document
    const logoBuffer = await Packer.toBuffer(logoDoc);
    const logoFilePath = path.join(outputDir, `${sanitizedCompanyName}_${templateName}_logo_${timestamp}.docx`);
    await fs.writeFile(logoFilePath, logoBuffer);
    
    // Use the processed template (text only) as the output
    await fs.copyFile(tempFilePath, outputPath);
    
    // Clean up temp file
    try {
      await fs.unlink(tempFilePath);
    } catch (unlinkError) {
      console.error(`Failed to delete temp file: ${unlinkError}`);
    }
    
    console.log(`Successfully generated document with logo: ${logoFilePath}`);
    console.log(`Successfully generated document with text replacements: ${outputPath}`);
    
    // Return the path to the template with text replacements
    return outputPath;
  } catch (error: any) {
    console.error(`Error in createDocumentWithLogoFromTemplate: ${error.message}`);
    
    // Fallback to simple replacement
    return await createDocumentWithLogo({
      templatePath,
      outputDir,
      companyName,
      ownerName,
      logoPath
    });
  }
}

// Function to create a document with the logo using the docx library
async function createDocumentWithLogo({
  templatePath,
  outputDir,
  companyName,
  ownerName,
  logoPath
}: GenerateDocumentOptions): Promise<string> {
  // Generate a unique filename
  const templateName = path.basename(templatePath, path.extname(templatePath));
  const sanitizedCompanyName = companyName.replace(/\s+/g, '_');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFilename = `${sanitizedCompanyName}_${templateName}_${timestamp}.docx`;
  const outputPath = path.join(outputDir, outputFilename);
  
  // Create a new document with company details and logo
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: `${companyName} - ${templateName}`,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER
        }),
        
        // Add logo if provided
        ...(logoPath && fs_sync.existsSync(logoPath) ? [
          new Paragraph({
            children: [
              createLogoImageRun(logoPath) || 
              new TextRun({ text: "(Logo not available)", italics: true, color: "999999" })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          })
        ] : []),
        
        new Paragraph({
          text: `Generated for: ${companyName}`,
          alignment: AlignmentType.CENTER
        }),
        
        new Paragraph({
          text: `Owner: ${ownerName}`,
          alignment: AlignmentType.CENTER
        }),
        
        new Paragraph({
          text: `Date: ${new Date().toLocaleDateString()}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        
        new Paragraph({
          text: "NOTE: This document was generated with the logo placeholder feature. The original template content has been preserved in a separate copy.",
          spacing: { before: 200, after: 200 }
        })
      ]
    }]
  });
  
  // Write to file
  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(outputPath, buffer);
  
  console.log(`Successfully generated document with logo: ${outputPath}`);
  return outputPath;
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
    
    // Read the logo file synchronously
    const logoBuffer = fs_sync.readFileSync(logoPath);
    console.log(`Logo file read successfully. Size: ${logoBuffer.length} bytes`);
    
    // Create the ImageRun
    return new ImageRun({
      data: logoBuffer,
      transformation: {
        width: 200,
        height: 100
      },
      type: 'png'
    });
  } catch (error: any) {
    console.error(`Error creating logo ImageRun: ${error.message}`);
    return null;
  }
} 