const maxBytes = 2 * 1024 * 1024;

type DetectedImage = {
  mime: "image/jpeg" | "image/png" | "image/webp";
};

export function detectImage(buffer: Buffer): DetectedImage | null {
  if (buffer.length < 12 || buffer.length > maxBytes) {
    return null;
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg" };
  }
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { mime: "image/png" };
  }
  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && webp === "WEBP") {
    return { mime: "image/webp" };
  }
  return null;
}
