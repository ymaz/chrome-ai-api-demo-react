# Chrome Summarizer API Demo

A comprehensive React component demonstrating Chrome's experimental Summarizer API with on-device AI capabilities.

## Features

### Core Functionality
- **On-Device Summarization**: All processing happens locally in the browser
- **Multiple Summary Types**:
  - **TL;DR**: Quick summary of the main points
  - **Key Points**: Bullet-point style highlights
  - **Teaser**: Engaging preview to capture interest
  - **Headline**: Short, catchy title

### Advanced Options
- **Output Formats**: Plain text or Markdown
- **Summary Length**: Short, Medium, or Long
- **Streaming Mode**: Real-time summary generation
- **Shared Context**: Guide summarization with custom context
- **Summary History**: Track your last 10 summaries

### UI Components (shadcn/ui)
- Beautiful, accessible component library
- Responsive design for all screen sizes
- Dark mode ready (with theme support)
- Toast notifications for user feedback
- Progress indicators for model downloads

## Browser Requirements

### Minimum Requirements
- Chrome Dev or Chrome Canary version 127+
- Experimental Summarization API enabled

### Setup Instructions

1. **Install Chrome Dev/Canary**
   - Download from [Chrome Canary](https://www.google.com/chrome/canary/)

2. **Enable the Summarization API**
   - Navigate to `chrome://flags`
   - Search for "Summarization API for Gemini Nano"
   - Enable the flag
   - Restart Chrome

3. **Download AI Model**
   - Visit `chrome://components`
   - Find "Optimization Guide On Device Model"
   - Click "Check for update"
   - Wait for download to complete

4. **Verify Setup**
   - Open the demo application
   - Check if status shows "readily" available

## Usage Examples

### Basic Summarization
```typescript
// The component handles everything internally
// Just select your options and click "Summarize"
```

### API Structure
```typescript
interface SummarizerOptions {
  type?: 'tl;dr' | 'key-points' | 'teaser' | 'headline';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
}

// Create summarizer
const summarizer = await window.ai.summarizer.create({
  type: 'tl;dr',
  format: 'plain-text',
  length: 'medium'
});

// Generate summary
const summary = await summarizer.summarize(text);

// Or use streaming
const stream = summarizer.summarizeStreaming(text);
```

## Sample Texts Included

1. **Tech Article** - AI and machine learning overview
2. **News Story** - Climate change breakthrough
3. **Blog Post** - Web development learning journey
4. **Scientific Abstract** - Research on intermittent fasting

## Component Architecture

### State Management
- React hooks for local state
- useRef for API instances
- useEffect for initialization and cleanup

### Key Functions
- `checkAPISupport()` - Verify browser compatibility
- `createSummarizer()` - Initialize with progress monitoring
- `summarizeText()` - Generate summaries (regular or streaming)
- `copyToClipboard()` - Copy results to clipboard

### TypeScript Interfaces
Full type safety with:
- `SummarizerAvailability`
- `SummarizerOptions`
- `Summarizer`
- Custom event types

## Privacy & Security

- **100% Local Processing**: No data leaves your device
- **No External API Calls**: Everything runs in the browser
- **Private by Default**: Your text never touches a server
- **Offline Capable**: Works without internet (after model download)

## Performance

- **Model Size**: ~100-200MB (one-time download)
- **Inference Speed**: Near-instant for most texts
- **Memory Usage**: Optimized for efficiency
- **Streaming**: Reduces perceived latency

## Limitations

- Only available in Chrome 127+
- Requires experimental flag enabled
- Model must be downloaded first
- Summary quality depends on input text
- Some languages may work better than others

## Development

### Built With
- React 19
- TypeScript 5.9
- Vite 7
- shadcn/ui
- Tailwind CSS
- Lucide React (icons)

### Component Structure
```
src/components/
  └── summarizer.tsx    # Main component (800+ lines)
```

### Running Locally
```bash
npm install
npm run dev
```

### Building
```bash
npm run build
```

## Troubleshooting

### "API Not Supported" Error
- Ensure you're using Chrome 127+
- Check that the flag is enabled
- Restart browser after enabling flag

### "Model Downloading" Stuck
- Check your internet connection
- Visit `chrome://components` manually
- Force update the Optimization Guide

### Summary Quality Issues
- Try different summary types
- Adjust summary length
- Add specific context in shared context field
- Ensure input text is well-structured

## Future Enhancements

- [ ] Language detection integration
- [ ] Batch summarization
- [ ] Export summaries to various formats
- [ ] Custom summary templates
- [ ] Integration with translation API
- [ ] Summary comparison mode

## Resources

- [Chrome Built-in AI APIs Documentation](https://developer.chrome.com/docs/ai/built-in)
- [Summarization API Proposal](https://github.com/explainers-by-googlers/writing-assistance-apis)
- [shadcn/ui Components](https://ui.shadcn.com)

## License

MIT License - Feel free to use in your own projects!

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

**Note**: This is an experimental API and subject to change. Features may not work in all configurations.
