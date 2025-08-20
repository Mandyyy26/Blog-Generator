import React, { useState, useEffect } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { FormData } from '../types';
import { saveFormData } from '../lib/storage';

interface BlogFormProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function BlogForm({ 
  formData, 
  onFormDataChange, 
  onSubmit, 
  isLoading,
  error 
}: BlogFormProps) {
  const [tagInput, setTagInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Auto-save form data
  useEffect(() => {
    const timer = setTimeout(() => {
      saveFormData(formData);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [formData]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.topic.trim()) {
      errors.topic = 'Topic is required';
    } else if (formData.topic.trim().length < 10) {
      errors.topic = 'Topic must be at least 10 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      onFormDataChange({
        ...formData,
        tags: [...formData.tags, tag]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onFormDataChange({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const isFormValid = formData.topic.trim().length >= 10;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Topic *
        </label>
        <textarea
          id="topic"
          value={formData.topic}
          onChange={(e) => onFormDataChange({ ...formData, topic: e.target.value })}
          placeholder="Describe the topic you want to write about..."
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
            validationErrors.topic 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
          disabled={isLoading}
        />
        {validationErrors.topic && (
          <p className="mt-1 text-sm text-red-500">{validationErrors.topic}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {formData.topic.length}/10 minimum characters
        </p>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title (Optional)
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
          placeholder="Leave blank to auto-generate"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                disabled={isLoading}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagInputKeyPress}
            placeholder="Add a tag..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!tagInput.trim() || isLoading}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          'Generate Blog Post'
        )}
      </button>
    </form>
  );
}