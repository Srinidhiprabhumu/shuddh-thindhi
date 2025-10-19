import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  maxImages = 5,
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      const filesToUpload: File[] = [];

      // Add valid image files to upload
      for (let i = 0; i < files.length && (value.length + filesToUpload.length) < maxImages; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          formData.append('images', file);
          filesToUpload.push(file);
        }
      }

      if (filesToUpload.length === 0) return;

      // Upload to server
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onChange([...value, ...result.images]);
    } catch (error) {
      console.error('Error uploading images:', error);
      // Fallback to data URLs for preview if upload fails
      const newImages: string[] = [];
      for (let i = 0; i < files.length && (value.length + newImages.length) < maxImages; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
          newImages.push(dataUrl);
        }
      }
      onChange([...value, ...newImages]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const canAddMore = value.length < maxImages;

  return (
    <div className={className}>
      <Label>Product Images</Label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
        {value.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Product ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border border-border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {canAddMore && (
          <div
            className="h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground text-center">
                  Click to upload
                  <br />
                  ({value.length}/{maxImages})
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground mt-2">
        Upload up to {maxImages} images. Supported formats: JPG, PNG, GIF
      </p>
    </div>
  );
};