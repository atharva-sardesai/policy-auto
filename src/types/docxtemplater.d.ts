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
    getImage?: (tagValue: any, tagName?: string) => any;
    getSize?: (tagValue: any, tagName?: any) => [number, number];
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