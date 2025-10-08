# Tetris Game API Endpoints

## Authentication

All protected endpoints require authentication via JWT token in the Authorization header: `Bearer <token>`

## User Profile & Statistics

### Get Current User Profile (Comprehensive)

```
GET /api/users/me/profile
```

Returns complete profile data for the authenticated user including:

- Basic user info (username, avatar, email, etc.)
- Comprehensive game statistics with calculated fields (win rate, play time formatted, etc.)
- List of unlocked achievements
- Performance indicators and skill level
- Experience progress and level information

**Response example:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "player1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "stats": {
      "totalGames": 25,
      "totalWins": 18,
      "totalLosses": 7,
      "winRate": 72.0,
      "lossRate": 28.0,
      "highScore": 15000,
      "totalLines": 450,
      "currentStreak": 5,
      "longestStreak": 8,
      "totalPlayTime": 7200,
      "playTimeFormatted": "2h 0m",
      "level": 12,
      "experience": 1500,
      "expToNextLevel": 400
    },
    "achievements": ["first_game", "first_win", "score_1000", "level_10"],
    "totalAchievements": 4,
    "performance": {
      "isOnStreak": true,
      "recentForm": "excellent",
      "skillLevel": "Advanced"
    }
  }
}
```

### Get Current User (Basic)

```
GET /api/users/me
```

Returns basic authenticated user information without calculated fields.

### Get User Statistics

```
GET /api/users/:id/stats
```

Returns comprehensive user statistics for any user (requires auth).

### Get Leaderboard

```
GET /api/users/leaderboard
```

**Public endpoint** - Returns leaderboard based on user high scores.

Query parameters:

- `limit` (optional): Number of entries to return (default: 50)

## Game Completion

### Complete a Game

```
POST /api/users/:id/complete-game
```

Completes a game session and updates user statistics automatically. Also checks for new achievements.

Request body:

```json
{
  "score": 5000,
  "lines": 25,
  "duration": 180,
  "result": "win"
}
```

Response includes updated user stats and any newly unlocked achievements.

### Update User Stats (Manual)

```
PUT /api/users/:id/stats
```

Manually update user statistics. Mainly for admin use or corrections.

## Achievements

### Get User Achievements

```
GET /api/achievements/user/:userId
```

Returns the list of achievement names unlocked by the user (just the string identifiers).

### Check Achievements

```
POST /api/achievements/user/:userId/check
```

Checks user's current stats and unlocks any new achievements.

## Achievement Types (Frontend Implementation)

The backend returns just the achievement name strings. The frontend should implement a comprehensive enum:

```javascript
const ACHIEVEMENTS = {
  first_game: {
    name: "First Game",
    description: "Play your first game",
    icon: "🎮",
    rarity: "common",
  },
  first_win: {
    name: "First Victory",
    description: "Win your first game",
    icon: "🏆",
    rarity: "common",
  },
  win_streak_5: {
    name: "Streak Master",
    description: "Win 5 games in a row",
    icon: "🔥",
    rarity: "rare",
  },
  win_streak_10: {
    name: "Unstoppable",
    description: "Win 10 games in a row",
    icon: "⚡",
    rarity: "epic",
  },
  score_1000: {
    name: "Rising Star",
    description: "Score 1,000 points",
    icon: "⭐",
    rarity: "common",
  },
  score_5000: {
    name: "High Scorer",
    description: "Score 5,000 points",
    icon: "🌟",
    rarity: "rare",
  },
  score_10000: {
    name: "Score Legend",
    description: "Score 10,000 points",
    icon: "💎",
    rarity: "epic",
  },
  lines_100: {
    name: "Line Clearer",
    description: "Clear 100 lines",
    icon: "📏",
    rarity: "common",
  },
  lines_500: {
    name: "Line Master",
    description: "Clear 500 lines",
    icon: "🎯",
    rarity: "rare",
  },
  lines_1000: {
    name: "Line Legend",
    description: "Clear 1,000 lines",
    icon: "👑",
    rarity: "epic",
  },
  play_time_1h: {
    name: "Dedicated Player",
    description: "Play for 1 hour total",
    icon: "⏰",
    rarity: "common",
  },
  play_time_10h: {
    name: "Tetris Addict",
    description: "Play for 10 hours total",
    icon: "🕐",
    rarity: "rare",
  },
  level_10: {
    name: "Level Up",
    description: "Reach level 10",
    icon: "📈",
    rarity: "common",
  },
  level_25: {
    name: "Expert Player",
    description: "Reach level 25",
    icon: "🎓",
    rarity: "rare",
  },
  level_50: {
    name: "Tetris Master",
    description: "Reach level 50",
    icon: "👨‍🎓",
    rarity: "legendary",
  },
};
```

## Example Frontend Integration

### Get comprehensive profile data:

```javascript
const response = await fetch("/api/users/me/profile", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
const profileData = await response.json();

// Use profileData.data to populate profile page
console.log(`Welcome ${profileData.data.username}!`);
console.log(
  `Level ${profileData.data.stats.level} ${profileData.data.performance.skillLevel}`
);
console.log(`${profileData.data.totalAchievements} achievements unlocked`);
```

### Complete a game:

```javascript
const gameResult = await fetch(`/api/users/${userId}/complete-game`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    score: 1500,
    lines: 15,
    duration: 120,
    result: "win",
  }),
});
```

### Get leaderboard (no auth required):

```javascript
const leaderboard = await fetch("/api/users/leaderboard?limit=10");
const data = await leaderboard.json();
```

## Key Features for Frontend

1. **Single Profile Endpoint**: `/api/users/me/profile` gives everything needed for profile page
2. **Calculated Fields**: Win rates, formatted play times, skill levels automatically calculated
3. **Achievement Integration**: Just the names returned, frontend handles display
4. **Performance Indicators**: Recent form and streak status for gamification
5. **Public Leaderboard**: No authentication required for viewing leaderboard
6. **Automatic Updates**: Game completion updates stats and checks achievements automatically
