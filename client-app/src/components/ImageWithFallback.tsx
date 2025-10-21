import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  fallbackSrc = `${window.location.origin}/attached_assets/generated_images/Traditional_thekua_sweet_snacks_abfa8650.png`,
  alt,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src?.startsWith('http') ? src : `${window.location.origin}${src}`);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
      loading="lazy"
    />
  );
};