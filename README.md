# MovieFlix - Professional React Movie App

A production-ready, enterprise-grade movie browsing application built with React, TypeScript, and modern development practices.

## 🚀 Features

### Core Functionality
- **Movie Discovery**: Browse Now Playing, Popular, and Top Rated movies
- **Advanced Search**: Real-time search with debouncing
- **Detailed Views**: Click any movie for comprehensive details
- **Responsive Design**: Optimized for all device sizes
- **Accessibility**: WCAG 2.1 AA compliant

### Technical Excellence
- **TypeScript**: Full type safety and IntelliSense
- **Modular Architecture**: Clean separation of concerns
- **Custom Hooks**: Reusable business logic
- **Service Layer**: Centralized API management
- **Error Boundaries**: Graceful error handling
- **Performance**: Lazy loading, debouncing, pagination

## 🏗️ Architecture

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # API and external services
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
└── __tests__/          # Test files
```

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, CSS3
- **Build Tool**: Vite
- **API**: The Movie Database (TMDB)
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, TypeScript compiler

## 📦 Installation

```bash
# Clone repository
git clone <repository-url>
cd my-movie-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your TMDB API key to .env

# Start development server
npm run dev
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🌐 Environment Variables

```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add `VITE_TMDB_API_KEY` environment variable
3. Deploy automatically on push to main

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🧪 Testing

```bash
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 📊 Performance Features

- **Lazy Loading**: Images load on demand
- **Debounced Search**: Reduces API calls
- **Pagination**: Load more content progressively
- **Service Worker**: Basic offline support
- **Code Splitting**: Optimized bundle sizes

## ♿ Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management

## 🔒 Security

- Environment variable protection
- XSS prevention
- HTTPS enforcement
- Content Security Policy ready

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🎯 Job-Ready Features Demonstrated

### Frontend Development
- ✅ React with Hooks and modern patterns
- ✅ TypeScript for type safety
- ✅ Responsive CSS and modern layouts
- ✅ Component-based architecture

### Software Engineering
- ✅ Clean code principles
- ✅ SOLID design patterns
- ✅ Error handling and edge cases
- ✅ Performance optimization

### DevOps & Deployment
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Environment configuration
- ✅ Production build optimization
- ✅ Deployment automation

### Testing & Quality
- ✅ Unit testing setup
- ✅ Code linting and formatting
- ✅ Type checking
- ✅ Accessibility compliance

### API Integration
- ✅ RESTful API consumption
- ✅ Error handling and retry logic
- ✅ Data transformation and caching
- ✅ Service layer abstraction

This project demonstrates enterprise-level React development skills suitable for senior frontend positions.