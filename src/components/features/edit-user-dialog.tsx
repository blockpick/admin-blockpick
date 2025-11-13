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
import { useUpdateUser } from '@/lib/hooks/use-users';
import { useUser } from '@/lib/hooks/use-users';
import { storageService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const userFormSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요'),
  nickname: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface EditUserDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ userId, open, onOpenChange }: EditUserDialogProps) {
  const { toast } = useToast();
  const updateUser = useUpdateUser();
  const { data: userData } = useUser(userId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      nickname: '',
    },
  });

  // 사용자 데이터가 로드되면 폼 초기화
  useEffect(() => {
    if (userData?.data) {
      const user = userData.data;
      form.reset({
        email: user.email,
        nickname: user.nickname || '',
      });
      setProfileImageUrl(user.profileImageUrl || null);
    }
  }, [userData, form]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: '이미지 파일만 업로드 가능합니다',
          variant: 'destructive',
        });
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    if (userData?.data?.profileImageUrl) {
      setProfileImageUrl(userData.data.profileImageUrl);
    } else {
      setProfileImageUrl(null);
    }
  };

  const onSubmit = async (data: UserFormValues) => {
    if (!userId) return;

    setIsSubmitting(true);
    try {
      let profileImageUrl: string | undefined;

      // 프로필 이미지 업로드
      if (profileImage) {
        setIsUploadingImage(true);
        try {
          const uploadResult = await storageService.uploadImage(profileImage, 'users');
          profileImageUrl = uploadResult.url;
        } catch (error) {
          toast({
            title: '이미지 업로드 실패',
            description: error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다.',
            variant: 'destructive',
          });
          setIsUploadingImage(false);
          setIsSubmitting(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const result = await updateUser.mutateAsync({
        id: userId,
        data: {
          email: data.email,
          nickname: data.nickname || undefined,
          profileImageUrl,
        },
      });

      if (result.success) {
        toast({
          title: '사용자 수정 성공',
          description: '사용자 정보가 성공적으로 수정되었습니다.',
        });
        setProfileImage(null);
        onOpenChange(false);
      } else {
        toast({
          title: '사용자 수정 실패',
          description: result.message || '사용자 수정에 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '오류 발생',
        description: error instanceof Error ? error.message : '사용자 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>사용자 수정</DialogTitle>
          <DialogDescription>사용자 정보를 수정합니다.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* 프로필 이미지 업로드 */}
          <div className="space-y-2">
            <Label>프로필 이미지</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileImageUrl || undefined} />
                <AvatarFallback>
                  {(form.watch('nickname') || form.watch('email') || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                {profileImage ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">새 이미지 선택됨</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeImage}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="profile-image-upload-edit"
                    />
                    <Label
                      htmlFor="profile-image-upload-edit"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent"
                    >
                      <Upload className="h-4 w-4" />
                      {profileImageUrl ? '이미지 변경' : '이미지 업로드'}
                    </Label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                이메일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="user@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                {...form.register('nickname')}
                placeholder="닉네임 (선택사항)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setProfileImage(null);
                onOpenChange(false);
              }}
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
                '수정 완료'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

