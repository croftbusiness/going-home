'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Image as ImageIcon, Plus, X, Save, Trash2, 
  Palette, Flower2, Shirt, Camera, Box, Package, Sparkles,
  Loader2, AlertCircle, CheckCircle2, Maximize2, X as XIcon
} from 'lucide-react';

interface BoardItem {
  id: string;
  url: string;
  fileName?: string;
}

interface PlanningBoard {
  casketImages: BoardItem[];
  casketNotes: string;
  urnImages: BoardItem[];
  urnNotes: string;
  flowerImages: BoardItem[];
  flowerNotes: string;
  colorPaletteImages: BoardItem[];
  colorPaletteNotes: string;
  serviceStyleImages: BoardItem[];
  serviceStyleNotes: string;
  outfitImages: BoardItem[];
  outfitNotes: string;
  personalPhotos: BoardItem[];
  personalPhotosNotes: string;
  generalNotes: string;
}

interface Category {
  id: keyof PlanningBoard;
  label: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  imagesKey: keyof PlanningBoard;
  notesKey: keyof PlanningBoard;
}

const categories: Category[] = [
  {
    id: 'casketImages',
    label: 'Casket Choices',
    description: 'Caskets that reflect your style',
    icon: Box,
    color: 'text-[#A5B99A]',
    bgColor: 'bg-[#A5B99A]',
    imagesKey: 'casketImages',
    notesKey: 'casketNotes',
  },
  {
    id: 'urnImages',
    label: 'Urn Choices',
    description: 'Urns that speak to you',
    icon: Package,
    color: 'text-[#93B0C8]',
    bgColor: 'bg-[#93B0C8]',
    imagesKey: 'urnImages',
    notesKey: 'urnNotes',
  },
  {
    id: 'flowerImages',
    label: 'Flower Styles',
    description: 'Floral arrangements you love',
    icon: Flower2,
    color: 'text-[#A5B99A]',
    bgColor: 'bg-[#A5B99A]',
    imagesKey: 'flowerImages',
    notesKey: 'flowerNotes',
  },
  {
    id: 'colorPaletteImages',
    label: 'Color Palettes',
    description: 'Colors that create the right atmosphere',
    icon: Palette,
    color: 'text-[#93B0C8]',
    bgColor: 'bg-[#93B0C8]',
    imagesKey: 'colorPaletteImages',
    notesKey: 'colorPaletteNotes',
  },
  {
    id: 'serviceStyleImages',
    label: 'Service Style',
    description: 'Ceremony inspiration and atmosphere',
    icon: Sparkles,
    color: 'text-[#A5B99A]',
    bgColor: 'bg-[#A5B99A]',
    imagesKey: 'serviceStyleImages',
    notesKey: 'serviceStyleNotes',
  },
  {
    id: 'outfitImages',
    label: 'Outfits',
    description: 'Clothing preferences for the service',
    icon: Shirt,
    color: 'text-[#93B0C8]',
    bgColor: 'bg-[#93B0C8]',
    imagesKey: 'outfitImages',
    notesKey: 'outfitNotes',
  },
  {
    id: 'personalPhotos',
    label: 'Personal Photos',
    description: 'Photos that capture who you are',
    icon: Camera,
    color: 'text-[#A5B99A]',
    bgColor: 'bg-[#A5B99A]',
    imagesKey: 'personalPhotos',
    notesKey: 'personalPhotosNotes',
  },
];

export default function PlanningBoardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [board, setBoard] = useState<PlanningBoard>({
    casketImages: [],
    casketNotes: '',
    urnImages: [],
    urnNotes: '',
    flowerImages: [],
    flowerNotes: '',
    colorPaletteImages: [],
    colorPaletteNotes: '',
    serviceStyleImages: [],
    serviceStyleNotes: '',
    outfitImages: [],
    outfitNotes: '',
    personalPhotos: [],
    personalPhotosNotes: '',
    generalNotes: '',
  });
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; fileName?: string } | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    loadBoard();
  }, []);

  // Keyboard handler for ESC key to close image modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const loadBoard = async () => {
    try {
      const response = await fetch('/api/funeral/planning-board');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load board');
      }

      const data = await response.json();
      if (data.board) {
        setBoard(data.board);
      }
    } catch (err: any) {
      console.error('Error loading planning board:', err);
      setError(err.message || 'Failed to load planning board. Please ensure the database migration has been run.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (category: Category, file: File) => {
    setUploading(category.id);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category.id);

      const response = await fetch('/api/funeral/planning-board/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      const newItem: BoardItem = {
        id: Date.now().toString(),
        url: data.url,
        fileName: data.fileName,
      };

      setBoard(prev => ({
        ...prev,
        [category.imagesKey]: [...(prev[category.imagesKey] as BoardItem[]), newItem],
      }));

      // Auto-save
      await saveBoard();
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveImage = async (category: Category, itemId: string) => {
    setBoard(prev => ({
      ...prev,
      [category.imagesKey]: (prev[category.imagesKey] as BoardItem[]).filter(item => item.id !== itemId),
    }));
    await saveBoard();
  };

  const handleNotesChange = (category: Category, notes: string) => {
    setBoard(prev => ({
      ...prev,
      [category.notesKey]: notes,
    }));
  };

  const saveBoard = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/funeral/planning-board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(board),
      });

      if (!response.ok) {
        throw new Error('Failed to save board');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save board');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveBoard();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#A5B99A]" />
          <p className="text-[#2C2A29] opacity-60">Loading your planning board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-white to-[#FAF9F7]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
            <Link
              href="/dashboard/funeral-planning"
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                Visual Planning Board
              </h1>
              <p className="text-sm sm:text-base opacity-90">
                Create your personal vision board for burial or cremation choices
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 mb-1">Error Loading Planning Board</p>
                <p className="text-sm text-red-700">{error}</p>
                {error.includes('migration') && (
                  <div className="mt-3 p-3 bg-red-100 rounded border border-red-300">
                    <p className="text-xs font-medium text-red-900 mb-1">To fix this:</p>
                    <ol className="text-xs text-red-800 list-decimal list-inside space-y-1">
                      <li>Run the SQL migration in your Supabase dashboard</li>
                      <li>Execute: <code className="bg-red-200 px-1 rounded">supabase/funeral_planning_board_schema.sql</code></li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">Changes saved successfully</p>
          </div>
        )}

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-br from-[#A5B99A]/20 to-[#93B0C8]/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-[#A5B99A]" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#2C2A29] mb-2">
                Build Your Personal Vision Board
              </h2>
              <p className="text-sm text-[#2C2A29] opacity-70 leading-relaxed">
                Upload images of caskets, urns, flowers, colors, outfits, and photos that inspire you. 
                This visual board helps you express your preferences in a personal, meaningful way. 
                Think of it like Pinterest—collect what speaks to you, and we'll help bring your vision to life.
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const images = board[category.imagesKey] as BoardItem[];
            const notes = board[category.notesKey] as string;
            const isExpanded = expandedCategory === category.id;
            const isUploading = uploading === category.id;

            return (
              <div
                key={category.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 ${category.bgColor} bg-opacity-10 rounded-xl`}>
                      <Icon className={`w-6 h-6 ${category.color}`} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-[#2C2A29]">{category.label}</h3>
                      <p className="text-sm text-[#2C2A29] opacity-70">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {images.length > 0 && (
                      <span className="text-sm text-[#A5B99A] font-medium">
                        {images.length} image{images.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </button>

                {/* Category Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    {/* Upload Button */}
                    <div className="mt-6 mb-4">
                      <input
                        ref={(el: HTMLInputElement | null) => {
                          fileInputRefs.current[category.id] = el;
                        }}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileSelect(category, file);
                          }
                        }}
                      />
                      <button
                        onClick={() => fileInputRefs.current[category.id]?.click()}
                        disabled={isUploading}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            <span>Add Image</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Images Grid - Pinterest Style Masonry */}
                    {images.length > 0 ? (
                      <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 mb-6">
                        {images.map((item) => (
                          <div
                            key={item.id}
                            className="group relative mb-4 break-inside-avoid rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all cursor-pointer"
                            onClick={() => setSelectedImage({ url: item.url, fileName: item.fileName })}
                          >
                            <div className="relative">
                              <img
                                src={item.url}
                                alt={item.fileName || 'Planning board image'}
                                className="w-full h-auto object-cover rounded-xl"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                <div className="absolute top-2 right-2">
                                  <div className="p-2 bg-white/90 rounded-full backdrop-blur-sm">
                                    <Maximize2 className="w-4 h-4 text-[#2C2A29]" />
                                  </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                  {item.fileName && (
                                    <p className="text-white text-xs font-medium truncate mb-1">
                                      {item.fileName}
                                    </p>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveImage(category, item.id);
                                    }}
                                    className="w-full px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium flex items-center justify-center space-x-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mb-6 p-12 border-2 border-dashed border-gray-300 rounded-xl text-center">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-[#2C2A29] opacity-60">
                          No images yet. Click "Add Image" to start building your collection.
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                        Notes for {category.label}
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => handleNotesChange(category, e.target.value)}
                        onBlur={saveBoard}
                        rows={3}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                        placeholder={`Add any notes or thoughts about ${category.label.toLowerCase()}...`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* General Notes */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-[#2C2A29] mb-4">General Notes</h3>
          <textarea
            value={board.generalNotes}
            onChange={(e) => setBoard(prev => ({ ...prev, generalNotes: e.target.value }))}
            onBlur={saveBoard}
            rows={4}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
            placeholder="Any general thoughts or preferences about your planning board..."
          />
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </main>

      {/* Image Modal/Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors text-white"
              aria-label="Close"
            >
              <XIcon className="w-6 h-6" />
            </button>

            {/* Image */}
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.fileName || 'Planning board image'}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Image Info */}
            {selectedImage.fileName && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-white text-sm font-medium">{selectedImage.fileName}</p>
              </div>
            )}

            {/* Keyboard hint */}
            <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg">
              <p className="text-white text-xs opacity-70">Press ESC to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

