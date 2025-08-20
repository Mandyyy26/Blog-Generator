import { FormData } from '../types';

const STORAGE_KEY = 'blog-generator-data';
const THEME_KEY = 'blog-generator-theme';

export function saveFormData(data: FormData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save form data:', error);
  }
}

export function loadFormData(): FormData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load form data:', error);
  }
  
  return {
    topic: '',
    title: '',
    tags: []
  };
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Failed to save theme:', error);
  }
}

export function loadTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (error) {
    console.error('Failed to load theme:', error);
  }
  
  // Default to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}