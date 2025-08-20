import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

interface MarkdownEditorProps {
  content: string;
  isDark: boolean;
}

export function MarkdownEditor({ content, isDark }: MarkdownEditorProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Markdown
        </h3>
      </div>
      <div className="flex-1">
        <CodeMirror
          value={content}
          height="100%"
          readOnly
          theme={isDark ? oneDark : undefined}
          extensions={[markdown()]}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
          }}
        />
      </div>
    </div>
  );
}