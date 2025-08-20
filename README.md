# Blog Generator

A production-ready single-page web application for generating blog posts using your n8n webhook. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- 🎯 **Smart Form**: Topic validation, optional title, and tag management with removable chips
- 📊 **Progress Tracking**: Animated 5-step progress indicator with real-time status
- 📝 **Dual Preview**: Side-by-side markdown preview and raw code editor
- 💾 **Auto-Save**: Persistent form data in localStorage
- 🌙 **Dark Mode**: Full dark mode support with preference persistence
- 📋 **Export Options**: Copy to clipboard, download as .md file, or open in external drive
- 🔄 **Error Handling**: Graceful error handling with retry mechanism and exponential backoff
- 📱 **Responsive**: Mobile-friendly design that works on all screen sizes
- 🚀 **Mock Mode**: Demo functionality when no webhook is configured

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your n8n webhook URL:

   ```env
   VITE_WEBHOOK_URL=https://your-n8n-domain/webhook/generate-blog
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## API Integration

The app expects your n8n webhook to:

### Accept POST requests with:

```json
{
  "topic": "Your blog topic description",
  "title": "Optional custom title",
  "tags": ["tag1", "tag2"]
}
```

### Return JSON response:

```json
{
  "title": "Generated Blog Title",
  "slug": "generated-blog-slug",
  "markdown": "# Full markdown content...",
  "fileUrl": "https://optional-link-to-file"
}
```

## CORS Setup

If you encounter CORS issues, enable CORS in your n8n webhook:

1. In your n8n workflow, add a "Set" node before your response
2. Set the following headers:
   - `Access-Control-Allow-Origin`: `*` (or your specific domain)
   - `Access-Control-Allow-Methods`: `POST, OPTIONS`
   - `Access-Control-Allow-Headers`: `Content-Type`

## Project Structure

```
src/
├── components/          # React components
│   ├── BlogForm.tsx    # Main form with validation
│   ├── Stepper.tsx     # Progress indicator
│   ├── MarkdownPreview.tsx  # Rendered markdown view
│   ├── MarkdownEditor.tsx   # Raw markdown editor
│   ├── ResultActions.tsx    # Export/copy actions
│   └── ErrorPanel.tsx       # Error handling UI
├── lib/                # Utility functions
│   ├── download.ts     # File download helpers
│   ├── wordCount.ts    # Word counting logic
│   ├── storage.ts      # localStorage utilities
│   └── analytics.ts    # Event tracking (console logs)
├── types.ts           # TypeScript type definitions
└── App.tsx           # Main application component
```

## Development

- **Mock Mode**: If no `VITE_WEBHOOK_URL` is provided, the app runs in mock mode with simulated responses
- **Auto-save**: Form data is automatically saved to localStorage as you type
- **Word Count**: Real-time word count in the markdown preview
- **Responsive**: Tested on mobile, tablet, and desktop viewports
- **Analytics**: Built-in event tracking hooks (currently console logs)

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **react-markdown** - Markdown rendering with GFM support
- **CodeMirror** - Code editor for raw markdown
- **Lucide React** - Icon system
- **Sonner** - Toast notifications

## License

MIT License - feel free to use this in your own projects!
