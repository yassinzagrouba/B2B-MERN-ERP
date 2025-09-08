import { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  altText: string;
}

const ProductGallery = ({
  images,
  altText,
}: ProductGalleryProps) => {
  const [mainImage, setMainImage] = useState(images[0] || '');

  // If no images provided, show placeholder
  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">No image available</span>
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div className="w-full h-96 overflow-hidden rounded-lg mb-4 bg-gray-100">
        <img
          src={mainImage}
          alt={altText}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Thumbnails - only show if there are multiple images */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <div
              key={index}
              className={`cursor-pointer border-2 rounded overflow-hidden h-20 
                ${image === mainImage ? 'border-indigo-500' : 'border-transparent hover:border-gray-300'}`}
              onClick={() => setMainImage(image)}
            >
              <img
                src={image}
                alt={`${altText} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
