'use client';

import { useState, useRef } from 'react';
import { User, Camera, X, Loader2 } from 'lucide-react';

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

  const handleDelete = async () => {
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

  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden border-2 border-[#A5B99A] bg-[#A5B99A] bg-opacity-10 flex items-center justify-center group cursor-pointer`}>
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
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </>
        ) : (
          <User className="w-8 h-8 sm:w-10 sm:h-10 text-[#A5B99A]" />
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      {currentUrl && !uploading && (
        <button
          onClick={handleDelete}
          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors touch-target"
          title="Remove profile picture"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
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
      
      <label
        htmlFor="profile-picture-upload"
        className="absolute inset-0 cursor-pointer"
        title={currentUrl ? 'Change profile picture' : 'Add profile picture'}
      />

      {error && (
        <div className="absolute top-full left-0 mt-2 bg-red-50 text-red-700 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}

