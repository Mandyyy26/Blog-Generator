import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, FileText } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { BlogForm } from './components/BlogForm';
import { Stepper } from './components/Stepper';
import { MarkdownPreview } from './components/MarkdownPreview';
import { MarkdownEditor } from './components/MarkdownEditor';
import { ResultActions } from './components/ResultActions';
import { ErrorPanel } from './components/ErrorPanel';
import { FormData, BlogResponse, StepperStep } from './types';
import { loadFormData, loadTheme, saveTheme } from './lib/storage';
import { slugify } from './lib/download';
import { trackEvent } from './lib/analytics';

const STEPS: StepperStep[] = [
  { id: 1, name: 'Outline', description: 'Creating structure', status: 'pending' },
  { id: 2, name: 'Draft', description: 'Writing content', status: 'pending' },
  { id: 3, name: 'Format', description: 'Styling text', status: 'pending' },
  { id: 4, name: 'Front-matter', description: 'Adding metadata', status: 'pending' },
  { id: 5, name: 'Save', description: 'Finalizing', status: 'pending' },
];


function stripFrontMatter(md: string): string {
    if (!md) return md;
    // Only treat it as front-matter if it starts at the very beginning
    if (md.startsWith('---')) {
      // Find the closing fence starting on a new line
      const end = md.indexOf('\n---', 3);
      if (end !== -1) {
        const after = md.slice(end + 4);
        // trim a single leading blank line if present
        return after.replace(/^\s*\n/, '');
      }
    }
    return md;
  }

function normalizeN8nBlogResponse(raw: any): BlogResponse {
    // Flat object
    if (raw && raw.title && raw.markdown) return raw as BlogResponse;
  
    // n8n: array of items
    if (Array.isArray(raw) && raw.length > 0) {
      const item0 = raw[0];
  
      // Shape: [{ json: { title, slug, markdown, fileUrl? } }]
      if (item0?.json?.markdown) {
        return {
          title: item0.json.title,
          slug: item0.json.slug,
          markdown: item0.json.markdown,
          fileUrl: item0.json.fileUrl,
        } as BlogResponse;
      }
  
      // Shape: [{ title, slug, markdown, ... }]
      if (item0?.markdown) {
        return {
          title: item0.title,
          slug: item0.slug,
          markdown: item0.markdown,
          fileUrl: item0.fileUrl,
        } as BlogResponse;
      }
    }
  
    // Sometimes wrapped under data/result
    if (raw?.data?.markdown) return raw.data as BlogResponse;
    if (raw?.result?.markdown) return raw.result as BlogResponse;
  
    throw new Error('Unexpected response shape from webhook');
  }

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [formData, setFormData] = useState<FormData>({ topic: '', title: '', tags: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<StepperStep[]>(STEPS);
  const [result, setResult] = useState<BlogResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const togglePreviewExpanded = () => setPreviewExpanded(v => !v);

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const abortControllerRef = useRef<AbortController>();

  const maxRetries = 3;
  const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;

  useEffect(() => {
    // Load saved data
    setFormData(loadFormData());
    const savedTheme = loadTheme();
    setTheme(savedTheme);
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const resetSteps = () => {
    setSteps(STEPS.map(step => ({ ...step, status: 'pending' })));
  };

  const updateSteps = (currentStepId: number) => {
    setSteps(prevSteps => 
      prevSteps.map(step => ({
        ...step,
        status: step.id < currentStepId ? 'complete' : 
                step.id === currentStepId ? 'current' : 'pending'
      }))
    );
  };

  const simulateProgress = () => {
    const stepDuration = 300; // 300ms per step
    
    for (let i = 1; i <= STEPS.length; i++) {
      setTimeout(() => {
        updateSteps(i);
      }, i * stepDuration);
    }
  };

  const generateMockResponse = (): BlogResponse => {
    const mockMarkdown = `# ${formData.title || 'Sample Blog Post'}

## Introduction

This is a sample blog post generated in mock mode. Since no webhook URL is configured, we're showing you what the interface would look like with actual content.

## Main Content

Here's some sample content with **bold text**, *italic text*, and \`inline code\`.

### Code Block Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### List Example

- Item one
- Item two  
- Item three

## Conclusion

This concludes our sample blog post. Configure your webhook URL to generate real content!

---

**Tags:** ${formData.tags.join(', ') || 'sample, demo, mock'}
`;

    return {
      title: formData.title || 'Sample Blog Post',
      slug: slugify(formData.title || 'sample-blog-post'),
      markdown: mockMarkdown,
      fileUrl: undefined
    };
  };

  const handleGenerate = async (data: FormData) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    setResult(null);
    setShowTimeoutWarning(false);
    resetSteps();

    trackEvent('generation_started', {
      topic: data.topic.slice(0, 50),
      hasTitle: !!data.title,
      tagCount: data.tags.length,
      retryCount
    });

    // Start progress simulation
    simulateProgress();

    // Set timeout warning
    timeoutRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, 25000);

    try {
      let response: BlogResponse;

      if (!webhookUrl) {
        // Mock mode
        await new Promise(resolve => setTimeout(resolve, 1500));
        response = generateMockResponse();
      } else {
        // Real API call
        abortControllerRef.current = new AbortController();
        
        const fetchResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: data.topic,
            title: data.title || undefined,
            tags: data.tags
          }),
          signal: abortControllerRef.current.signal
        });

        if (!fetchResponse.ok) {
          const errorText = await fetchResponse.text();
          setErrorDetails({
            status: fetchResponse.status,
            statusText: fetchResponse.statusText,
            body: errorText
          });
          throw new Error(`Request failed: ${fetchResponse.status} ${fetchResponse.statusText}`);
        }

        const raw = await fetchResponse.json();
        response = normalizeN8nBlogResponse(raw);

        // Ensure slug is present
        if (!response.slug && response.title) {
        response.slug = slugify(response.title);
        }
        
     
      }

      setResult(response);
      setRetryCount(0);
      
      trackEvent('generation_success', {
        title: response.title,
        slug: response.slug,
        hasFileUrl: !!response.fileUrl,
        retryCount
      });

      toast.success('Blog post generated successfully!');

    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Request was aborted, don't show error
      }

      const errorMessage = err.message || 'Failed to generate blog post';
      setError(errorMessage);
      
      trackEvent('generation_error', {
        error: errorMessage,
        retryCount
      });

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowTimeoutWarning(false);
    }
  };

  const handleRetry = () => {
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
    setRetryCount(prev => prev + 1);
    
    setTimeout(() => {
      handleGenerate(formData);
    }, delay);
  };

  return (
    <div className={`min-h-screen transition-colors ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <Toaster 
        theme={theme}
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
      />
      
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Blog Generator</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Form Section */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <BlogForm
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleGenerate}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>

        {/* Progress Section */}
        {(isLoading || result) && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <Stepper steps={steps} isLoading={isLoading} />
              
              {showTimeoutWarning && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    This is taking longer than usual, but we're still working on it...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && !isLoading && (
          <div className="mb-8">
            <ErrorPanel
              error={error}
              details={errorDetails}
              onRetry={handleRetry}
              retryCount={retryCount}
              maxRetries={maxRetries}
            />
          </div>
        )}

        {/* Result Section */}
        {result && !isLoading && (
          <div className="space-y-6">
            {/* Title and Slug */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {result.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                    {result.slug}
                  </span>
                </div>
              </div>
            </div>

             {/* Preview controls */}
            <div className="flex items-center justify-end">
            <button
                onClick={togglePreviewExpanded}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600
                        hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-pressed={previewExpanded}
            >
                {previewExpanded ? 'Collapse preview' : 'Expand preview'}
            </button>
            </div>


            {/* Preview Panes */}
            <div className={previewExpanded ? "grid grid-cols-1 gap-6" : "grid lg:grid-cols-2 gap-6"}>
                {/* PREVIEW */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <MarkdownPreview content={stripFrontMatter(result.markdown)} />
                    </div>

                {/* EDITOR (hidden when expanded) */}
                {!previewExpanded && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <MarkdownEditor content={result.markdown} isDark={theme === 'dark'} />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <ResultActions 
                markdown={result.markdown} 
                slug={result.slug}
                fileUrl={result.fileUrl}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && !error && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              Ready to generate your blog post
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fill out the form above and click "Generate Blog Post" to get started
            </p>
            {!webhookUrl && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg inline-block">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Mock Mode:</strong> No webhook URL configured. Demo responses will be generated.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;