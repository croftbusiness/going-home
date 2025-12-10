'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Camera, Loader2, Trash2 } from 'lucide-react';

interface ProfilePictureUploadProps {
  currentUrl: string | null;
  onUploadComplete: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProfilePictureUpload({
  currentUrl,
  onUploadComplete,
  size = 'md',
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-32 h-32',
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload profile picture');
      }

      const data = await response.json();
      onUploadComplete(data.url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUrl) return;

    if (!confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await fetch('/api/user/profile-picture', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete profile picture');
      }

      onUploadComplete('');
    } catch (err: any) {
      setError(err.message || 'Failed to delete profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleChangeClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden border-2 border-[#A5B99A] bg-[#A5B99A] bg-opacity-10 flex items-center justify-center group cursor-pointer transition-all hover:border-[#93B0C8] hover:shadow-lg`}>
        {currentUrl ? (
          <>
            <img
              src={currentUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {/* Premium hover overlay with menu options */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex flex-col items-center justify-center gap-3">
              {/* Change Photo Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleChangeClick();
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-2 px-4 py-2 bg-white text-[#2C2A29] rounded-lg hover:bg-gray-50 shadow-md font-medium text-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Change Photo</span>
              </button>
              
              {/* Remove Photo Button */}
              <button
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-2 px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 shadow-md font-medium text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Photo</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-[#A5B99A] group-hover:text-[#93B0C8] transition-colors" />
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-[#93B0C8] mb-1" />
            </div>
          </>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" />
          </div>
        )}
      </div>
      
      {!currentUrl && (
        <p className="mt-2 text-xs text-[#2C2A29] opacity-70 text-center max-w-[120px]">
          Add your profile here
        </p>
      )}
      
      {currentUrl && (
        <p className="mt-2 text-xs text-[#2C2A29] opacity-70 text-center max-w-[140px]">
          Hover to change or remove
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="profile-picture-upload"
        disabled={uploading}
      />
      
      {!currentUrl && (
        <label
          htmlFor="profile-picture-upload"
          className="absolute inset-0 cursor-pointer"
          title="Add profile picture"
        />
      )}

      {error && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-red-50 text-red-700 text-xs px-3 py-2 rounded-lg shadow-md whitespace-nowrap z-30 border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
