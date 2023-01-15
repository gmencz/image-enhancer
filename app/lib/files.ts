export async function blobToDataUrl(blob: Blob) {
  const dataUrl = await new Promise<string>((resolve) => {
    let reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });

  return dataUrl;
}
