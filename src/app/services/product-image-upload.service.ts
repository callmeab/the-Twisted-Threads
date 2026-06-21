import { Injectable, inject, signal } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';

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
  private storage = inject(Storage);

  /** Active upload progress list (used by the form UI) */
  uploadTasks = signal<UploadTask[]>([]);

  /**
   * Upload one image to Firebase Storage.
   * Returns { url, storagePath } on success.
   */
  async uploadOne(file: File, productId: string): Promise<UploadedImage> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const storagePath = `products/${productId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const storageRef = ref(this.storage, storagePath);

    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
      });

      task.on(
        'state_changed',
        snapshot => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          this._updateProgress(file.name, pct, 'uploading');
        },
        error => {
          this._updateProgress(file.name, 0, 'error', error.message);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          this._updateProgress(file.name, 100, 'done');
          resolve({ url, storagePath });
        },
      );
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
    try {
      await deleteObject(ref(this.storage, storagePath));
    } catch (err: any) {
      // 404 = already deleted — safe to ignore
      if (err?.code !== 'storage/object-not-found') throw err;
    }
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
