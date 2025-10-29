# Chrome Translator API Demo 🌍

A comprehensive demonstration of Google Chrome's built-in Translator API using React, TypeScript, and Shadcn UI components. This demo showcases on-device translation capabilities without sending data to external servers.

## 🚀 Features

### Core Capabilities
- **🔄 Real-time Translation**: Translate text between 16+ languages instantly
- **✨ Language Detection**: Automatically detect the source language with confidence scores
- **📊 Streaming Translation**: Watch translations appear word-by-word in real-time
- **📥 Model Download Progress**: Monitor language pack downloads with progress indicators
- **📜 Translation History**: Keep track of your recent translations
- **🔒 Privacy-First**: All processing happens locally on your device

### Supported Languages
- 🇬🇧 English
- 🇪🇸 Spanish  
- 🇫🇷 French
- 🇩🇪 German
- 🇮🇹 Italian
- 🇵🇹 Portuguese
- 🇷🇺 Russian
- 🇨🇳 Chinese
- 🇯🇵 Japanese
- 🇰🇷 Korean
- 🇸🇦 Arabic
- 🇮🇳 Hindi
- 🇳🇱 Dutch
- 🇵🇱 Polish
- 🇹🇷 Turkish
- 🇸🇪 Swedish

## 📋 Prerequisites

### Browser Requirements
- **Chrome Version**: 138 or later (Chrome Dev or Chrome Canary recommended)
- **Operating System**: Windows 10/11, macOS 13+, Linux, or ChromeOS
- **Storage**: At least 22 GB free space for language models

### Enable Chrome Built-in AI

1. **Open Chrome Flags**
   - Navigate to `chrome://flags` in your address bar

2. **Enable Translation API**
   - Search for "Experimental translation API"
   - Set it to "Enabled"
   - Click "Relaunch" to restart Chrome

3. **Configure Language Packs** (Optional but recommended)
   - Go to `chrome://flags/#translation-api`
   - Select "Enabled without language pack limit" for more language pairs
   - Restart Chrome again

4. **Install Language Models**
   - Visit `chrome://on-device-translation-internals/`
   - Install the language packs you want to use
   - Each pack is downloaded on first use

5. **For Local Development** (if using localhost)
   - Visit `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
   - Add your local development URL (e.g., `http://localhost:3000`)
   - Enable the flag and restart Chrome

## 🎯 Quick Start

### Option 1: Using the Standalone HTML File

1. Open `translator-demo.html` in Chrome 138+
2. The demo will check for API support automatically
3. Start translating!

### Option 2: Using the React Component

```bash
# Install dependencies
npm install react react-dom typescript
npm install @radix-ui/react-* # For Shadcn UI components
npm install lucide-react # For icons

# Add the component to your project
cp translator-api-demo.tsx src/components/

# Import and use in your app
import TranslatorAPIDemo from './components/translator-api-demo';

function App() {
  return <TranslatorAPIDemo />;
}
```

## 💻 API Usage Examples

### Basic Translation

```javascript
// Check if API is available
if ('Translator' in window) {
  // Create a translator
  const translator = await window.Translator.create({
    sourceLanguage: 'en',
    targetLanguage: 'es'
  });
  
  // Translate text
  const result = await translator.translate('Hello, world!');
  console.log(result); // "¡Hola, mundo!"
  
  // Clean up
  translator.destroy();
}
```

### Streaming Translation

```javascript
const translator = await window.Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'fr'
});

// Get a streaming translation
const stream = translator.translateStreaming('Long text to translate...');
const reader = stream.getReader();

let fullTranslation = '';
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  fullTranslation += value;
  console.log('Chunk:', value); // Display as it streams
}
```

### Language Detection

```javascript
if ('LanguageDetector' in window) {
  const detector = await window.LanguageDetector.create();
  await detector.ready;
  
  const results = await detector.detect('Bonjour le monde');
  console.log(results);
  // [{ language: 'fr', confidence: 0.95 }]
}
```

### Monitor Download Progress

```javascript
const translator = await window.Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'ja',
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      const progress = (e.loaded / e.total) * 100;
      console.log(`Download progress: ${progress}%`);
    });
  }
});
```

## 🎨 UI Components

The demo uses Shadcn UI components with Tailwind CSS for a modern, accessible interface:

- **Cards**: Container components for sections
- **Buttons**: Interactive elements with loading states
- **Textarea**: Input and output fields
- **Select**: Language dropdowns
- **Progress**: Download progress indicators
- **Tabs**: Navigation between features
- **Toast**: Notifications for user feedback
- **Alert**: Status messages and warnings
- **Badge**: Language and status indicators

## 🔧 Customization

### Adding New Languages

```javascript
const LANGUAGES = [
  // Add your language here
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  // ... existing languages
];
```

### Modifying Translation Settings

```javascript
// Adjust input quota check
const MAX_INPUT_LENGTH = 5000; // characters

// Change streaming chunk size
const STREAM_CHUNK_SIZE = 100; // characters

// Set default languages
const DEFAULT_SOURCE = 'en';
const DEFAULT_TARGET = 'es';
```

## 🐛 Troubleshooting

### API Not Available
- Ensure Chrome version is 138+
- Check that flags are enabled
- Restart Chrome after enabling flags
- Try Chrome Dev or Canary channels

### Language Pack Download Issues
- Check available storage space (22GB+ recommended)
- Ensure stable internet connection
- Visit `chrome://components` and check for updates
- Try different language pairs

### Translation Fails
- Check input quota limits
- Verify language codes are correct
- Ensure models are downloaded
- Check browser console for errors

## 📊 Performance Considerations

- **First Load**: Initial model download may take time
- **Model Caching**: Models are cached after first download
- **Input Limits**: Each translator has an input quota
- **Memory Usage**: Keep translations reasonable in length
- **Concurrent Translations**: Process sequentially for best performance

## 🔐 Privacy & Security

- ✅ **No Cloud Dependencies**: Everything runs locally
- ✅ **No Data Collection**: Your translations stay on your device
- ✅ **No API Keys Required**: No authentication needed
- ✅ **Offline Capable**: Works without internet (after model download)

## 📚 Resources

- [Chrome AI Documentation](https://developer.chrome.com/docs/ai/built-in-apis)
- [Translator API Reference](https://developer.chrome.com/docs/ai/translator-api)
- [Language Detector API](https://developer.chrome.com/docs/ai/language-detection)
- [MDN Web Docs](https://developer.mozilla.org/docs/Web/API/Translator_and_Language_Detector_APIs)
- [Shadcn UI Components](https://ui.shadcn.com/)

## 🤝 Contributing

Feel free to enhance this demo! Some ideas:

- Add more language pairs
- Implement batch translation
- Add voice input/output
- Create translation shortcuts
- Build a browser extension
- Add file translation support

## 📄 License

This demo is provided as-is for educational purposes. Feel free to use and modify for your projects.

## 🎉 Acknowledgments

- Google Chrome team for the built-in AI APIs
- Shadcn for the beautiful UI components
- The open-source community for React and TypeScript

---

**Note**: This is an experimental API and may change. Always check the latest Chrome documentation for updates.

Happy translating! 🌍✨