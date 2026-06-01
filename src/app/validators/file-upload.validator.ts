export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_RECEIPT_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export function validateReceiptFile(file: File): string | null {
  if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
    return 'Invalid file format. Upload JPG, PNG, or PDF only.';
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return 'File is too large. Maximum upload size is 5MB.';
  }

  return null;
}
