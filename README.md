# Chrome Built-in AI APIs Demo

A comprehensive demonstration of Chrome's experimental Built-in AI APIs, showcasing on-device AI capabilities including translation and text summarization.

![Chrome AI Demo](https://img.shields.io/badge/Chrome-127%2B-4285F4?logo=googlechrome&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)

## Features

### 🌐 Translator API
- Multi-language translation (16+ languages)
- Real-time streaming translation
- Language detection with confidence scores
- On-device processing for complete privacy
- Translation history tracking

### 🧠 Summarizer API
- Multiple summary types: TL;DR, Key Points, Teaser, Headline
- Configurable output formats: Plain Text, Markdown
- Adjustable summary length: Short, Medium, Long
- Streaming mode for real-time generation
- Context-aware summarization
- Summary history

## Quick Start

### Prerequisites
- Chrome Dev or Chrome Canary (version 127+)
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd chrome-ai-api-demo

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Enabling Chrome AI APIs

#### For Translator API:
1. Open `chrome://flags`
2. Search for "Experimental translation API"
3. Enable the flag
4. Restart Chrome
5. Visit `chrome://on-device-translation-internals/`
6. Install required language packs

#### For Summarizer API:
1. Open `chrome://flags`
2. Search for "Summarization API for Gemini Nano"
3. Enable the flag
4. Restart Chrome
5. Visit `chrome://components`
6. Find "Optimization Guide On Device Model"
7. Click "Check for update"

## Tech Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## Project Structure

```
chrome-ai-api-demo/
├── src/
│   ├── components/
│   │   ├── translator.tsx      # Translator API demo
│   │   ├── summarizer.tsx      # Summarizer API demo
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   └── utils.ts            # Utility functions
│   ├── App.tsx                 # Main application
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── SUMMARIZER_README.md       # Detailed Summarizer docs
└── README.md                  # This file
```

## Component Documentation

### Translator Component
See the component file for full TypeScript interfaces and implementation details.

Key features:
- 16 supported languages with flag indicators
- Streaming and batch translation modes
- Automatic language detection
- Download progress monitoring
- Input quota management

### Summarizer Component
See [SUMMARIZER_README.md](./SUMMARIZER_README.md) for comprehensive documentation.

Key features:
- 4 summary types (TL;DR, Key Points, Teaser, Headline)
- 2 output formats (Plain Text, Markdown)
- 3 length options (Short, Medium, Long)
- Streaming mode support
- Context-aware summarization

## Privacy & Security

**100% On-Device Processing**
- All AI operations happen locally in your browser
- No data is sent to external servers
- Complete privacy and security
- Works offline (after model download)

## Browser Compatibility

| Feature | Chrome Version | Status |
|---------|---------------|--------|
| Translator API | 138+ | Experimental |
| Summarizer API | 127+ | Experimental |
| Language Detector | 138+ | Experimental |

## Known Limitations

- APIs are experimental and may change
- Requires specific Chrome versions
- Model downloads required (100-200MB)
- Some features may not work in all configurations
- Limited to supported languages/formats

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Building Components

This project uses shadcn/ui for components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Resources

- [Chrome Built-in AI Documentation](https://developer.chrome.com/docs/ai/built-in)
- [Translation API Explainer](https://github.com/WICG/translation-api)
- [Summarization API Explainer](https://github.com/explainers-by-googlers/writing-assistance-apis)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Chrome team for the experimental AI APIs
- shadcn for the beautiful UI components
- Vercel for Vite and Next.js inspiration

---

**Note**: These are experimental APIs and are subject to change. Always check the official Chrome documentation for the latest information.
