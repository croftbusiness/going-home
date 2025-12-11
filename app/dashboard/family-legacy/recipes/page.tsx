'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Plus, X, Edit2, Trash2, Upload, Image as ImageIcon } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  ingredients: string;
  instructions: string;
  photoUrl?: string;
  storyBehindRecipe?: string;
  createdAt: string;
  updatedAt: string;
}

export default function RecipesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    photoUrl: '',
    storyBehindRecipe: '',
  });

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const response = await fetch('/api/user/family-legacy/recipes');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load recipes');
      }
      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await handleFileUpload(file);
      setFormData({ ...formData, photoUrl: url });
    } catch (error) {
      alert('Failed to upload photo. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/user/family-legacy/recipes` : `/api/user/family-legacy/recipes`;
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save recipe');

      await loadRecipes();
      resetForm();
    } catch (error) {
      alert('Failed to save recipe. Please try again.');
    }
  };

  const handleEdit = (recipe: Recipe) => {
    setFormData({
      title: recipe.title,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      photoUrl: recipe.photoUrl || '',
      storyBehindRecipe: recipe.storyBehindRecipe || '',
    });
    setEditingId(recipe.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const response = await fetch(`/api/user/family-legacy/recipes?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete recipe');

      await loadRecipes();
    } catch (error) {
      alert('Failed to delete recipe. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      ingredients: '',
      instructions: '',
      photoUrl: '',
      storyBehindRecipe: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A5B99A] mx-auto mb-4"></div>
          <p className="text-[#2C2A29] opacity-70">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2A29] mb-2">Favorite Recipes</h1>
            <p className="text-[#2C2A29] opacity-70">Share your beloved recipes with the stories behind them</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 font-semibold self-start sm:self-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Recipe</span>
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#2C2A29]">
                {editingId ? 'Edit Recipe' : 'New Recipe'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#2C2A29]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">Photo (Optional)</label>
                {formData.photoUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.photoUrl}
                      alt="Recipe"
                      className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photoUrl: '' })}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#A5B99A] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A5B99A]"></div>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent"
                  placeholder="e.g., Grandma's Chocolate Chip Cookies"
                />
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Ingredients *
                </label>
                <textarea
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
                  placeholder="List each ingredient on a new line..."
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Instructions *
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  required
                  rows={8}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
                  placeholder="Step-by-step instructions..."
                />
              </div>

              {/* Story */}
              <div>
                <label className="block text-sm font-medium text-[#2C2A29] mb-2">
                  Story Behind This Recipe (Optional)
                </label>
                <textarea
                  value={formData.storyBehindRecipe}
                  onChange={(e) => setFormData({ ...formData, storyBehindRecipe: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-transparent resize-none"
                  placeholder="Why is this recipe special? What memories does it hold?"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  {editingId ? 'Update Recipe' : 'Save Recipe'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-100 text-[#2C2A29] rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recipes Grid */}
        {recipes.length === 0 && !showForm ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200/50">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#2C2A29] opacity-70 mb-6">No recipes yet. Add your first recipe to get started.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              Add Your First Recipe
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {recipe.photoUrl && (
                  <img
                    src={recipe.photoUrl}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#2C2A29] mb-2">{recipe.title}</h3>
                  {recipe.storyBehindRecipe && (
                    <p className="text-sm text-[#2C2A29] opacity-70 mb-4 line-clamp-2">
                      {recipe.storyBehindRecipe}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(recipe)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-[#2C2A29] rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

