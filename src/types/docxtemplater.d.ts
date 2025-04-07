declare module 'docxtemplater' {
  interface DocxtemplaterOptions {
    paragraphLoop?: boolean;
    linebreaks?: boolean;
    modules?: any[];
    parser?: (tag: string) => { type: string; value: string; module?: string };
  }

  class Docxtemplater {
    constructor(zip: any, options?: DocxtemplaterOptions);
    setData(data: Record<string, any>): void;
    resolveData(data: Record<string, any>): Promise<void>;
    render(): void;
    getZip(): {
      generate(options: { type: string; compression: string }): any;
    };
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
  class PizZip {
    constructor(data?: Buffer | ArrayBuffer | Uint8Array | string);
  }
  
  export = PizZip;
} 