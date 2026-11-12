declare const SERVER_API_URL: string;
declare const I18N_HASH: string;
declare const __VERSION__: string;
declare const __TYPE__: string;

// file-saver 1.x ships no type declarations
declare module 'file-saver/FileSaver' {
  export function saveAs(data: Blob, filename?: string): void;
}
