/**
 * Storage/File management hooks using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageService } from '../api';
import { shouldEnableQuery, shouldEnableQueryWith } from './query-utils';

/**
 * Query keys for storage-related queries
 */
export const storageKeys = {
  all: ['storage'] as const,
  files: () => [...storageKeys.all, 'files'] as const,
  fileList: (params?: { folder?: string; page?: number; size?: number }) =>
    [...storageKeys.files(), params] as const,
  file: (id: string) => [...storageKeys.files(), id] as const,
};

/**
 * Hook to get file list
 */
export function useFiles(params?: { folder?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: storageKeys.fileList(params),
    queryFn: () => storageService.getFiles(params),
    enabled: shouldEnableQuery(),
  });
}

/**
 * Hook to get file information
 */
export function useFileInfo(fileId: string) {
  return useQuery({
    queryKey: storageKeys.file(fileId),
    queryFn: () => storageService.getFileInfo(fileId),
    enabled: shouldEnableQueryWith(!!fileId),
  });
}

/**
 * Hook to upload single image
 */
export function useUploadImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      storageService.uploadImage(file, folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storageKeys.files() });
    },
  });
}

/**
 * Hook to upload multiple images
 */
export function useUploadImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ files, folder }: { files: File[]; folder?: string }) =>
      storageService.uploadImages(files, folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storageKeys.files() });
    },
  });
}

/**
 * Hook to delete file
 */
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => storageService.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storageKeys.files() });
    },
  });
}

