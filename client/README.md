# GitShame Client 🎨

> React TypeScript frontend for the GitHub Roaster application

A modern, responsive React application that provides an intuitive interface for GitHub profile analysis and AI-generated roasts.

## ✨ Features

- 🔍 **GitHub User Search**: Intuitive search with username validation
- 📊 **Data Visualization**: Interactive charts for commit patterns and insights
- 🤖 **AI Integration**: Seamless communication with FastAPI backend
- 🎨 **Modern UI**: GitHub-inspired design with smooth animations
- 📱 **Responsive Design**: Works beautifully on all device sizes
- ⚡ **Fast Loading**: Optimized performance with Vite
- 🛡️ **Type Safety**: Full TypeScript implementation
- 🔄 **Smart Fallbacks**: Multiple error handling layers

## 🏗️ Architecture

```
Components/
├── GitHubSearch/      # Main search interface
├── GitHubProfile/     # User profile and roasts display
└── App/              # Root application component

API Services/
├── github.ts         # GitHub API client
├── client.ts         # Backend API client  
├── analyzer.ts       # Data analysis and roast generation
└── config.ts         # API configuration

Styles/
├── App.css          # Global styles
├── GitHubSearch.css # Search component styles
└── GitHubProfile.css # Profile component styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- GitShame backend server running on port 8000

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### API Configuration

The client is configured to communicate with the backend API:

```typescript
// src/api/config.ts
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};
```

### Environment Variables

Create a `.env.local` file for environment-specific settings:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE="GitShame - GitHub Roaster"
VITE_GITHUB_API_BASE=https://api.github.com
```

## 📦 Dependencies

### Core Dependencies

- **React 18**: UI library with hooks and modern features
- **TypeScript**: Type safety and better development experience
- **Axios**: HTTP client for API requests
- **Vite**: Fast build tool and development server

### Development Dependencies

- **@types/react**: TypeScript definitions for React
- **ESLint**: Code linting and quality enforcement
- **Vite**: Build tool and dev server

## 🎨 Styling

### Design System

The application uses a custom CSS design system inspired by GitHub's interface:

- **Colors**: Dark theme with GitHub's color palette
- **Typography**: Inter font family with responsive sizing
- **Spacing**: 8px grid system
- **Components**: Consistent button, input, and card styles

### CSS Architecture

```
styles/
├── App.css           # Global styles and CSS variables
├── GitHubSearch.css  # Search page styles
└── GitHubProfile.css # Profile and roast display styles
```

## 🔌 API Integration

### GitHub API Client

```typescript
// Fetches user data, repositories, and commits
const userData = await githubAPI.getAllUserData(username);
```

### Backend API Client

```typescript
// Generates AI-powered roasts
const roasts = await apiClient.generateRoasts(analysisData);
```

### Error Handling

The client implements comprehensive error handling:

- Network errors and timeouts
- GitHub API rate limiting
- Backend service unavailability
- Invalid user inputs
- Graceful fallbacks

## 📊 Components

### GitHubSearch

Main search interface component:

- Username input with validation
- GitHub username format checking
- Loading states
- Error messaging
- Example suggestions

**Props**: None (manages internal state)

### GitHubProfile

Profile display and roast presentation:

- User information display
- Repository insights
- Commit pattern visualization
- AI roast presentation
- Interactive charts

**Props**:
- `username: string` - GitHub username to display
- `onReset: () => void` - Callback to return to search

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Performance

### Optimization Features

- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Caching**: API responses cached for 5 minutes
- **Debouncing**: Search input debounced
- **Image Optimization**: Avatar images optimized

### Bundle Analysis

```bash
# Analyze bundle size
npm run build:analyze
```

## 🔒 Security

### Security Measures

- **Input Validation**: All user inputs validated
- **XSS Prevention**: React's built-in XSS protection
- **HTTPS Only**: Production builds enforce HTTPS
- **API Key Security**: No API keys exposed in frontend

## 📱 Responsive Design

### Breakpoints

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+

### Features

- Flexible layouts
- Touch-friendly interactions
- Mobile-optimized components
- Progressive enhancement

## 🔍 Debugging

### Development Tools

```bash
# Enable detailed logging
VITE_LOG_LEVEL=debug npm run dev

# React Developer Tools (browser extension)
# Network tab for API inspection
# Console for debugging
```

### Common Issues

**Backend Connection Issues:**
```bash
# Check if backend is running
curl http://localhost:8000/health
```

**Build Issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

### Development Workflow

1. **Setup development environment**
   ```bash
   npm install
   npm run dev
   ```

2. **Make changes and test**
   ```bash
   npm test
   npm run lint
   ```

3. **Build and verify**
   ```bash
   npm run build
   npm run preview
   ```

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write meaningful component names
- Add JSDoc comments for complex functions

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [GitHub API Documentation](https://docs.github.com/en/rest)

## 📄 License

This project is part of GitShame and is licensed under the MIT License.

---

**Built with ⚛️ React and ❤️ for great developer experience**
