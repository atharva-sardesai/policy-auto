declare module 'docxtemplater' {
  import PizZip from 'pizzip';

  interface DocxTemplaterOptions {
    paragraphLoop?: boolean;
    linebreaks?: boolean;
  }

  class Docxtemplater {
    constructor(zip: PizZip, options?: DocxTemplaterOptions);
    render(data?: Record<string, unknown>): void;
    getZip(): PizZip;
  }

  export = Docxtemplater;
}

declare module 'docxtemplater-image-module-free' {
  interface ImageModuleOptions {
    centered?: boolean;
    getImage?: (tagValue: string | Buffer, tagName?: string) => Promise<Buffer>;
    getSize?: (tagValue: string | Buffer, tagName?: string) => [number, number];
  }

  class ImageModule {
    constructor(options: ImageModuleOptions);
  }

  export = ImageModule;
}

declare module 'pizzip' {
  interface PizZipFile {
    asText(): string;
  }

  class PizZip {
    constructor(data?: Buffer | Uint8Array | ArrayBuffer | string);
    file(path: string): PizZipFile | null;
    file(path: string, data: string): PizZip;
    generate(options: { type: string; compression?: string }): Buffer;
  }

  export = PizZip;
}

declare module 'docx-templates' {
  interface CreateReportOptions {
    template: Buffer;
    data: Record<string, unknown>;
    cmdDelimiter?: [string, string];
    processLineBreaks?: boolean;
    noSandbox?: boolean;
    rejectNullish?: boolean;
    failFast?: boolean;
    additionalJsContext?: Record<string, unknown>;
    errorHandler?: (error: Error, commandCode: string) => string;
  }

  interface ImageData {
    data: Buffer;
    width: number;
    height: number;
    extension: string;
  }

  interface ImageOptions {
    data: Buffer;
    transformation: {
      width: number;
      height: number;
    };
    type: string;
    fallback?: {
      type: string;
      data: Buffer;
    };
  }

  export function createReport(options: CreateReportOptions): Promise<Buffer>;
} 