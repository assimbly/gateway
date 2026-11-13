/** Lets the browser download the data as a file with the given name. */
export function saveAs(data: Blob, fileName: string): void {
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  // Not revoked at once: the browser may still be reading the Blob for a large download.
  setTimeout(() => URL.revokeObjectURL(url), 40_000);
}
