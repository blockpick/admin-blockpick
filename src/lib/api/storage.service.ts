/**
 * Storage/File Upload API Service
 * Based on OpenAPI spec: /admin/storage/upload/*
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-dev.blockpick.net';

// 단일 이미지 업로드 응답 (스펙 기준)
export interface UploadImageResponse {
  url: string;
  thumbnailUrl: string;
  message: string;
}

// 다중 이미지 업로드 응답 (스펙 기준)
export interface UploadImagesResponse {
  results: Array<{ fileName: string; url: string; thumbnailUrl: string }>;
  errors: Array<unknown>;
  successCount: number;
  errorCount: number;
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

  /**
   * Delete file
   * DELETE /admin/storage/files/{fileId}
   */
  deleteFile: async (fileId: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/storage/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Delete failed' }));
      throw errorData;
    }
  },

  /**
   * Get file list
   * GET /admin/storage/files
   */
  getFiles: async (params?: {
    folder?: string;
    page?: number;
    size?: number;
  }): Promise<{
    content: Array<{
      id: string;
      url: string;
      filename: string;
      folder: string;
      size: number;
      mimeType: string;
      createdAt: string;
    }>;
    totalElements: number;
    totalPages: number;
  }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();
    if (params?.folder) queryParams.append('folder', params.folder);
    if (params?.page !== undefined) queryParams.append('page', String(params.page));
    if (params?.size !== undefined) queryParams.append('size', String(params.size));

    const response = await fetch(
      `${API_BASE_URL}/admin/storage/files?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Fetch failed' }));
      throw errorData;
    }

    return await response.json();
  },

  /**
   * Get file information
   * GET /admin/storage/files/{fileId}
   */
  getFileInfo: async (fileId: string): Promise<{
    id: string;
    url: string;
    filename: string;
    folder: string;
    size: number;
    mimeType: string;
    createdAt: string;
    [key: string]: unknown;
  }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/storage/files/${fileId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Fetch failed' }));
      throw errorData;
    }

    return await response.json();
  },
};

