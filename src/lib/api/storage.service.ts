/**
 * Storage/File Upload API Service
 * Based on OpenAPI spec: /admin/storage/upload/*
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.blockpick.net';

export interface UploadImageResponse {
  url?: string;
  [key: string]: unknown;
}

export interface UploadImagesResponse {
  urls?: string[];
  [key: string]: unknown;
}

export const storageService = {
  /**
   * Upload single image
   * POST /admin/storage/upload/image
   */
  uploadImage: async (
    file: File,
    folder: string = 'products'
  ): Promise<UploadImageResponse> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${API_BASE_URL}/admin/storage/upload/image?folder=${folder}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw errorData;
    }

    return await response.json();
  },

  /**
   * Upload multiple images
   * POST /admin/storage/upload/images
   */
  uploadImages: async (
    files: File[],
    folder: string = 'products'
  ): Promise<UploadImagesResponse> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(
      `${API_BASE_URL}/admin/storage/upload/images?folder=${folder}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw errorData;
    }

    return await response.json();
  },
};

