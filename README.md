# ISO Policy Automation

A Next.js application for automating the generation of ISO policy documents using customizable templates.

## Features

- Upload and manage DOCX policy templates
- Generate customized policy documents with company details
- Download individual or batch policy documents
- Pure JavaScript implementation for document generation (no Python dependency)

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Document Generation

This application uses the `docx` and `docx-templates` libraries to generate policy documents from templates. The system:

1. Allows uploading DOCX templates with placeholders
2. Replaces placeholders like `{Company_Name}` and `{Owner_Name}` with user-provided values
3. Optionally adds company logos to documents
4. Creates downloadable DOCX files

## Template Formatting

When creating DOCX templates, use the following placeholder format:

- `{Company_Name}` - Will be replaced with the company name
- `{Owner_Name}` - Will be replaced with the owner name
- `{Generated_Date}` - Will be replaced with the current date

### Logo Insertion

To insert a logo in your DOCX template, you have several options:

1. **Basic placeholder** (standard size):
   ```
   {Logo}
   ```

2. **Function-style insertion**:
   
   Standard size:
   ```
   {insertLogo()}
   ```
   
   Custom size (width, height in pixels):
   ```
   {insertLogo(200, 80)}
   ```
   
   Predefined sizes:
   ```
   {insertSmallLogo()}    // 100 × 40 pixels
   {insertMediumLogo()}   // 160 × 60 pixels
   {insertLargeLogo()}    // 240 × 90 pixels
   ```

3. **Alternative formats** (for compatibility):
   ```
   {Company_Logo}
   {CompanyLogo}
   {Company.Logo}
   ```

#### Best Practices for Logo Insertion:

- **Template Placement**: Place the logo command on its own line in the template
- **Image Format**: Use PNG or JPEG format for best compatibility 
- **Image Size**: Keep your logo file reasonably sized (under 1MB recommended)
- **Aspect Ratio**: For best results, maintain the original aspect ratio of your logo
- **Troubleshooting**: If one insertion method doesn't work, try another from the options above
- **Testing**: For challenging templates, create a simple test document with just basic text and a logo placeholder

## Project Structure

- `/src` - Next.js application code
  - `/app` - Application routes and API endpoints
  - `/components` - React components
  - `/utils` - Utility functions including document generation
- `/templates` - Stores uploaded template files
- `/uploads` - Temporary storage for uploaded logos
- `/generated_policies` - Output directory for generated documents

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [docx library](https://docx.js.org/)
- [docx-templates](https://github.com/guigrpa/docx-templates)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
