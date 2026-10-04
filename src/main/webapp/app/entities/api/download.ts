/** Saves text as a file in the browser's downloads. */
export function downloadText(text: string, fileName: string, mediaType: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: mediaType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
