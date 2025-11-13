'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateProduct } from '@/lib/hooks/use-products';
import { useProduct } from '@/lib/hooks/use-products';
import { storageService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

const productFormSchema = z.object({
  name: z.string().min(1, '상품명을 입력해주세요'),
  description: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface EditProductDialogProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductDialog({ productId, open, onOpenChange }: EditProductDialogProps) {
  const { toast } = useToast();
  const updateProduct = useUpdateProduct();
  const { data: productData } = useProduct(productId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [defaultImage, setDefaultImage] = useState<File | null>(null);
  const [defaultImageUrl, setDefaultImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      brand: '',
      sku: '',
    },
  });

  // 상품 데이터가 로드되면 폼 초기화
  useEffect(() => {
    if (productData) {
      form.reset({
        name: productData.name,
        description: productData.description || '',
        brand: productData.brand || '',
        sku: productData.sku || '',
      });
      setThumbnailUrl(productData.thumbnailUrl || productData.thumbnail || null);
      setDefaultImageUrl(productData.imageUrl || productData.defaultImage || null);
    }
  }, [productData, form]);

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'thumbnail' | 'default'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: '이미지 파일만 업로드 가능합니다',
          variant: 'destructive',
        });
        return;
      }
      if (type === 'thumbnail') {
        setThumbnail(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setThumbnailUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setDefaultImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setDefaultImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (type: 'thumbnail' | 'default') => {
    if (type === 'thumbnail') {
      setThumbnail(null);
      if (productData?.thumbnailUrl || productData?.thumbnail) {
        setThumbnailUrl(productData.thumbnailUrl || productData.thumbnail || null);
      } else {
        setThumbnailUrl(null);
      }
    } else {
      setDefaultImage(null);
      if (productData?.imageUrl || productData?.defaultImage) {
        setDefaultImageUrl(productData.imageUrl || productData.defaultImage || null);
      } else {
        setDefaultImageUrl(null);
      }
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (!productId) return;

    setIsSubmitting(true);
    try {
      let thumbnailUrlValue: string | undefined;
      let defaultImageUrlValue: string | undefined;

      // 새 이미지 업로드
      if (thumbnail) {
        setIsUploadingImage(true);
        try {
          const uploadResult = await storageService.uploadImage(thumbnail, 'products');
          thumbnailUrlValue = uploadResult.url;
        } catch (error) {
          toast({
            title: '썸네일 업로드 실패',
            description: error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다.',
            variant: 'destructive',
          });
          setIsUploadingImage(false);
          setIsSubmitting(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      } else if (productData?.thumbnailUrl || productData?.thumbnail) {
        thumbnailUrlValue = productData.thumbnailUrl || productData.thumbnail;
      }

      if (defaultImage) {
        setIsUploadingImage(true);
        try {
          const uploadResult = await storageService.uploadImage(defaultImage, 'products');
          defaultImageUrlValue = uploadResult.url;
        } catch (error) {
          toast({
            title: '기본 이미지 업로드 실패',
            description: error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다.',
            variant: 'destructive',
          });
          setIsUploadingImage(false);
          setIsSubmitting(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      } else if (productData?.imageUrl || productData?.defaultImage) {
        defaultImageUrlValue = productData.imageUrl || productData.defaultImage;
      }

      await updateProduct.mutateAsync({
        id: productId,
        name: data.name,
        description: data.description || undefined,
        brand: data.brand || undefined,
        sku: data.sku || undefined,
        thumbnail: thumbnailUrlValue,
        defaultImage: defaultImageUrlValue,
      });

      toast({
        title: '상품 수정 성공',
        description: '상품이 성공적으로 수정되었습니다.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: '오류 발생',
        description: error instanceof Error ? error.message : '상품 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!productId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>상품 수정</DialogTitle>
          <DialogDescription>
            상품 정보를 수정합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              상품명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="상품명을 입력하세요"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="상품 설명을 입력하세요"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">브랜드</Label>
              <Input
                id="brand"
                {...form.register('brand')}
                placeholder="브랜드명"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                {...form.register('sku')}
                placeholder="SKU 코드"
              />
            </div>
          </div>

          {/* 썸네일 이미지 업로드 */}
          <div className="space-y-2">
            <Label>썸네일 이미지</Label>
            <div className="flex items-center gap-4">
              {thumbnailUrl ? (
                <div className="relative h-24 w-24 rounded-lg overflow-hidden border">
                  <Image
                    src={thumbnailUrl}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-lg border border-dashed flex items-center justify-center bg-muted">
                  <span className="text-xs text-muted-foreground">썸네일</span>
                </div>
              )}
              <div className="flex-1 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e, 'thumbnail')}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <Label
                  htmlFor="thumbnail-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
                >
                  <Upload className="h-4 w-4" />
                  {thumbnailUrl ? '썸네일 변경' : '썸네일 업로드'}
                </Label>
                {thumbnailUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage('thumbnail')}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 기본 이미지 업로드 */}
          <div className="space-y-2">
            <Label>기본 이미지</Label>
            <div className="flex items-center gap-4">
              {defaultImageUrl ? (
                <div className="relative h-24 w-24 rounded-lg overflow-hidden border">
                  <Image
                    src={defaultImageUrl}
                    alt="Default image preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-lg border border-dashed flex items-center justify-center bg-muted">
                  <span className="text-xs text-muted-foreground">기본 이미지</span>
                </div>
              )}
              <div className="flex-1 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e, 'default')}
                  className="hidden"
                  id="default-image-upload"
                />
                <Label
                  htmlFor="default-image-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
                >
                  <Upload className="h-4 w-4" />
                  {defaultImageUrl ? '기본 이미지 변경' : '기본 이미지 업로드'}
                </Label>
                {defaultImageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage('default')}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploadingImage}>
              {isSubmitting || isUploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploadingImage ? '업로드 중...' : '수정 중...'}
                </>
              ) : (
                '상품 수정'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

