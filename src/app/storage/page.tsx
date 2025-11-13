'use client';

import { useState, useRef } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { StatsCard } from '@/components/shared/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFiles, useDeleteFile, useUploadImage, useUploadImages, useFileInfo } from '@/lib/hooks/use-storage';
import { Folder, Upload, Trash2, Eye, Download, Image as ImageIcon, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Image from 'next/image';
import { ConfirmDialog } from '@/components/features/confirm-dialog';

const folders = ['products', 'games', 'users', 'general'];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export default function StoragePage() {
  const [selectedFolder, setSelectedFolder] = useState<string>('products');
  const [page, setPage] = useState(0);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [uploadFolder, setUploadFolder] = useState<string>('products');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: filesData, isLoading } = useFiles({
    folder: selectedFolder,
    page,
    size: 20,
  });

  const { data: fileInfo } = useFileInfo(selectedFileId || '');
  const deleteFile = useDeleteFile();
  const uploadImage = useUploadImage();
  const uploadImages = useUploadImages();

  const files = filesData?.content || [];
  const totalPages = filesData?.totalPages || 0;

  const handleDelete = async () => {
    if (!selectedFileId) return;
    try {
      await deleteFile.mutateAsync(selectedFileId);
      toast({
        title: '성공',
        description: '파일이 삭제되었습니다.',
      });
      setDeleteDialogOpen(false);
      setSelectedFileId(null);
    } catch (error) {
      toast({
        title: '오류',
        description: '파일 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      if (files.length === 1) {
        await uploadImage.mutateAsync({
          file: files[0],
          folder: uploadFolder,
        });
        toast({
          title: '성공',
          description: '파일이 업로드되었습니다.',
        });
      } else {
        const fileArray = Array.from(files);
        await uploadImages.mutateAsync({
          files: fileArray,
          folder: uploadFolder,
        });
        toast({
          title: '성공',
          description: `${fileArray.length}개의 파일이 업로드되었습니다.`,
        });
      }
      setUploadDialogOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '파일 업로드에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  // Calculate statistics
  const stats = {
    total: filesData?.totalElements || 0,
    images: files.filter((f) => isImageFile(f.mimeType)).length,
    other: files.filter((f) => !isImageFile(f.mimeType)).length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="File Storage"
          description="파일 업로드 및 관리"
          action={{
            label: '파일 업로드',
            icon: Upload,
            onClick: () => setUploadDialogOpen(true),
          }}
        />

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="총 파일 수"
            value={stats.total}
            icon={FileText}
            description={`${selectedFolder} 폴더`}
          />
          <StatsCard
            title="이미지 파일"
            value={stats.images}
            icon={ImageIcon}
            description="이미지 파일 수"
          />
          <StatsCard
            title="기타 파일"
            value={stats.other}
            icon={FileText}
            description="기타 파일 수"
          />
          <StatsCard
            title="총 용량"
            value={formatFileSize(stats.totalSize)}
            icon={Folder}
            description="전체 파일 크기"
          />
        </div>

        {/* Folder Selection */}
        <div className="flex items-center space-x-4">
          <Label>폴더 선택</Label>
          <Select value={selectedFolder} onValueChange={(value) => {
            setSelectedFolder(value);
            setPage(0);
          }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {folders.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  {folder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Files Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : files.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="파일이 없습니다"
            description={`${selectedFolder} 폴더에 파일이 없습니다.`}
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group relative overflow-hidden rounded-lg border bg-card"
                >
                  {isImageFile(file.mimeType) ? (
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      <Image
                        src={file.url}
                        alt={file.filename}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-muted">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="truncate text-sm font-medium">{file.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(file.createdAt), 'yyyy-MM-dd', { locale: ko })}
                    </p>
                  </div>
                  <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedFileId(file.id);
                            setPreviewDialogOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          상세보기
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownload(file.url, file.filename)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          다운로드
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedFileId(file.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  이전
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}

        {/* File Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>파일 정보</DialogTitle>
              <DialogDescription>파일 상세 정보</DialogDescription>
            </DialogHeader>
            {fileInfo ? (
              <div className="space-y-4">
                {isImageFile(fileInfo.mimeType) && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={fileInfo.url}
                      alt={fileInfo.filename}
                      fill
                      className="object-contain"
                      sizes="100vw"
                    />
                  </div>
                )}
                <div className="grid gap-4">
                  <div>
                    <Label>파일명</Label>
                    <div className="mt-1 text-sm">{fileInfo.filename}</div>
                  </div>
                  <div>
                    <Label>폴더</Label>
                    <div className="mt-1">
                      <Badge>{fileInfo.folder}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label>크기</Label>
                    <div className="mt-1 text-sm">{formatFileSize(fileInfo.size)}</div>
                  </div>
                  <div>
                    <Label>타입</Label>
                    <div className="mt-1 text-sm">{fileInfo.mimeType}</div>
                  </div>
                  <div>
                    <Label>업로드일</Label>
                    <div className="mt-1 text-sm">
                      {format(new Date(fileInfo.createdAt), 'yyyy-MM-dd HH:mm:ss', {
                        locale: ko,
                      })}
                    </div>
                  </div>
                  <div>
                    <Label>URL</Label>
                    <div className="mt-1 flex items-center space-x-2">
                      <code className="flex-1 truncate text-xs">{fileInfo.url}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(fileInfo.url);
                          toast({
                            title: '복사됨',
                            description: 'URL이 클립보드에 복사되었습니다.',
                          });
                        }}
                      >
                        복사
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <LoadingSpinner />
            )}
          </DialogContent>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>파일 업로드</DialogTitle>
              <DialogDescription>파일을 선택하여 업로드하세요</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>폴더 선택</Label>
                <Select value={uploadFolder} onValueChange={setUploadFolder}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder} value={folder}>
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>파일 선택</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="mt-2"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="파일 삭제"
          description="이 파일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          onConfirm={handleDelete}
          confirmText="삭제"
          variant="destructive"
        />
      </div>
    </AdminLayout>
  );
}

