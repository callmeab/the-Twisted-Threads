import { Injectable, inject, signal } from '@angular/core';
// Firebase storage removed in favor of Cloudinary

export interface UploadedImage {
  url: string;           // public download URL
  storagePath: string;   // Firebase Storage path for deletion
  file?: File;           // original file (pre-upload)
  preview?: string;      // local blob URL shown before upload
}

export interface UploadTask {
  file: File;
  progress: number;      // 0–100
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductImageUploadService {
// Firebase Storage removed

  /** Active upload progress list (used by the form UI) */
  uploadTasks = signal<UploadTask[]>([]);

  /**
   * Upload one image to Firebase Storage.
   * Returns { url, storagePath } on success.
   */
  async uploadOne(file: File, productId: string): Promise<UploadedImage> {
    const cloudName = 'dcoqvrwqu';
    const uploadPreset = 'twisted_thread_preset';
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', cloudinaryUrl, true);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          this._updateProgress(file.name, pct, 'uploading');
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          this._updateProgress(file.name, 100, 'done');
          resolve({ url: response.secure_url, storagePath: response.public_id });
        } else {
          this._updateProgress(file.name, 0, 'error', 'Upload failed');
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => {
        this._updateProgress(file.name, 0, 'error', 'Network error');
        reject(new Error('Network error'));
      };

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', `products/${productId}`);

      xhr.send(formData);
    });
  }

  /**
   * Upload multiple images in parallel.
   * Initialises progress entries before starting.
   */
  async uploadMany(files: File[], productId: string): Promise<UploadedImage[]> {
    this.uploadTasks.set(
      files.map(f => ({ file: f, progress: 0, status: 'pending' })),
    );
    return Promise.all(files.map(f => this.uploadOne(f, productId)));
  }

  /** Delete an image from Firebase Storage by its storage path */
  async deleteImage(storagePath: string): Promise<void> {
    if (!storagePath) return;
    // Unsigned deletion is not supported directly by Cloudinary frontend API.
    console.warn('Deletion of Cloudinary images from frontend is disabled for security.');
  }

  /** Generate a local blob preview URL for a File */
  createPreview(file: File): string {
    return URL.createObjectURL(file);
  }

  clearTasks(): void {
    this.uploadTasks.set([]);
  }

  private _updateProgress(
    name: string,
    progress: number,
    status: UploadTask['status'],
    error?: string,
  ): void {
    this.uploadTasks.update(tasks =>
      tasks.map(t =>
        t.file.name === name ? { ...t, progress, status, error } : t,
      ),
    );
  }
}
