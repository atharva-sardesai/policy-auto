import { promises as fs } from 'fs';
import path from 'path';

interface Document {
  id: string;
  filename: string;
  content: Buffer;
}

export async function getDocumentById(id: string): Promise<Document | null> {
  try {
    const docsDir = path.join(process.cwd(), 'generated_docs');
    const filePath = path.join(docsDir, id);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return null;
    }

    // Read the file
    const content = await fs.readFile(filePath);
    
    return {
      id,
      filename: id,
      content
    };
  } catch (error) {
    console.error('Error reading document:', error);
    return null;
  }
} 