# API Layer Documentation

This directory contains all React Query queries and mutations organized by feature.

## 📁 Structure

```
src/api/
├── auth/           # Authentication & user management
│   ├── queries.js  # Auth-related queries (useMe, useUserProfile, etc.)
│   ├── mutations.js # Auth-related mutations (useLogin, useRegister, etc.)
│   ├── keys.js     # Query keys and token utilities
│   └── index.js    # Re-exports all auth functionality
├── game/           # Game-related functionality
│   ├── queries.js  # Game queries (useGameSession, useLeaderboard, etc.)
│   ├── mutations.js # Game mutations (useCreateGameSession, useSubmitScore, etc.)
│   ├── keys.js     # Game query keys
│   └── index.js    # Re-exports all game functionality
└── index.js        # Main API exports
```

## 🎯 Usage Examples

### Authentication

```jsx
import { useMe, useLogin, useLogout } from "@/api/auth";

function MyComponent() {
  // Queries
  const { data: user, isLoading } = useMe();

  // Mutations
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  // Usage
  const handleLogin = async (credentials) => {
    await loginMutation.mutateAsync(credentials);
  };
}
```

### Game Features

```jsx
import { useLeaderboard, useSubmitScore } from "@/api/game";

function GameComponent() {
  // Queries
  const { data: leaderboard } = useLeaderboard("classic");

  // Mutations
  const submitScoreMutation = useSubmitScore();

  // Usage
  const handleSubmitScore = async (scoreData) => {
    await submitScoreMutation.mutateAsync(scoreData);
  };
}
```

## 🔑 Query Keys

Each feature has its own query key factory to ensure proper cache management:

### Auth Keys

- `authKeys.all` - Base key for all auth queries
- `authKeys.me()` - Current user data
- `authKeys.profile(userId)` - User profile by ID

### Game Keys

- `gameKeys.all` - Base key for all game queries
- `gameKeys.session(sessionId)` - Game session by ID
- `gameKeys.leaderboard()` - Leaderboard data
- `gameKeys.userStats(userId)` - User game statistics

## 🛠 Token Management

The `tokenUtils` object provides centralized token management:

```jsx
import { tokenUtils } from "@/api/auth";

// Check if user has tokens
if (tokenUtils.hasTokens()) {
  // User is authenticated
}

// Get tokens
const accessToken = tokenUtils.getAccessToken();
const refreshToken = tokenUtils.getRefreshToken();

// Set tokens
tokenUtils.setTokens(accessToken, refreshToken);

// Clear tokens
tokenUtils.clearTokens();
```

## 📦 Adding New Features

To add a new feature API:

1. Create a new folder: `src/api/[feature]/`
2. Create the required files:
   - `keys.js` - Query key factory
   - `queries.js` - React Query queries
   - `mutations.js` - React Query mutations
   - `index.js` - Re-export everything
3. Update `src/api/index.js` to export the new feature

## 🚀 Benefits

- **Feature-based organization** - Easy to find and maintain
- **Centralized query keys** - Proper cache invalidation
- **Type safety** - Better IDE support and error catching
- **Reusability** - Easy to share across components
- **Testability** - Isolated features for easier testing
- **Scalability** - Clean structure that grows with your app
