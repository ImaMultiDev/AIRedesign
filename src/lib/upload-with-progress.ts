/**
 * Subida multipart a /api/upload con progreso real (XMLHttpRequest).
 * La cookie de sesión se envía en mismo origen.
 */
export function uploadImageWithProgress(
  file: File,
  onProgress: (percent: number) => void,
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.responseType = "text";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.min(100, Math.round((100 * e.loaded) / e.total)));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as {
          url?: string;
          publicId?: string;
          error?: string;
        };
        if (xhr.status >= 200 && xhr.status < 300 && data.url && data.publicId) {
          resolve({ url: data.url, publicId: data.publicId });
        } else {
          reject(new Error(data.error ?? "Error de subida"));
        }
      } catch {
        reject(new Error("Respuesta no válida"));
      }
    };

    xhr.onerror = () => reject(new Error("Error de red"));

    const body = new FormData();
    body.append("file", file);
    xhr.send(body);
  });
}
