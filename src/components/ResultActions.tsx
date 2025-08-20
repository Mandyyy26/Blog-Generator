import React, { useState } from 'react';
import { Copy, Download, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';
import { downloadMarkdown } from '../lib/download';

interface ResultActionsProps {
  markdown: string;
  slug: string;
  fileUrl?: string;
}

export function ResultActions({ markdown, slug, fileUrl }: ResultActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      toast.success('Markdown copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    try {
      downloadMarkdown(markdown, slug);
      toast.success('Markdown file downloaded!');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleOpenInDrive = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? 'Copied!' : 'Copy Markdown'}
      </button>
      
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
      >
        <Download size={16} />
        Download .md
      </button>
      
      {fileUrl && (
        <button
          onClick={handleOpenInDrive}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
        >
          <ExternalLink size={16} />
          Open in Drive
        </button>
      )}
    </div>
  );
}