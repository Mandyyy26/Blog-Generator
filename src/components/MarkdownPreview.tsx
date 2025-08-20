import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { countWords } from '../lib/wordCount';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const wordCount = useMemo(() => countWords(content), [content]);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Preview
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {wordCount} words
        </span>
      </div>
      <div className="flex-1 overflow-auto p-6 bg-white dark:bg-gray-900">
        {content ? (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ node, inline, className, children, ...props }) => {
                  if (inline) {
                    return (
                      <code 
                        className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm" 
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <p>Generate a blog post to see the preview</p>
          </div>
        )}
      </div>
    </div>
  );
}