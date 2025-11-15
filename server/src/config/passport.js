import passport from "passport";
import { Strategy as FortyTwoStrategy } from "passport-42";
import { UserRepository } from "../repositories/userRepository.js";
import { AvatarService } from "../services/avatarService.js";

const userRepo = new UserRepository();
const avatarService = new AvatarService();

async function ensureUniqueUsername(base) {
  let username = base || "user";
  let suffix = 0;
  // Try up to a reasonable number to avoid infinite loops
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = suffix === 0 ? username : `${username}${suffix}`;
    const existing = await userRepo.findByUsername(candidate);
    if (!existing) return candidate;
    suffix += 1;
  }
}

// Only configure 42 OAuth if credentials are provided
if (process.env.FORTY_TWO_CLIENT_ID && process.env.FORTY_TWO_CLIENT_SECRET) {
  passport.use(
    new FortyTwoStrategy(
      {
        clientID: process.env.FORTY_TWO_CLIENT_ID,
        clientSecret: process.env.FORTY_TWO_CLIENT_SECRET,
        callbackURL: process.env.FORTY_TWO_CALLBACK_URL,
        scope: ["public"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user data from profile
          const externalAvatarUrl = profile._json?.image?.link || null;
          const userData = {
            email: profile.emails?.[0]?.value || null,
            username: profile.username || profile.login || null,
            firstName: profile.name?.givenName || profile.first_name || null,
            lastName: profile.name?.familyName || profile.last_name || null,
            avatar: null,
            fortyTwoId: profile.id,
          };

          // Check if user already exists by 42 ID or email
          let user = null;
          if (userData.fortyTwoId) {
            user = await userRepo.findByFortyTwoId(userData.fortyTwoId);
          }

          if (!user && userData.email) {
            user = await userRepo.findByEmail(userData.email);
          }

          if (user) {
            // Update existing user with 42 data if needed
            const updates = {};
            if (!user.fortyTwoId && userData.fortyTwoId) {
              updates.fortyTwoId = userData.fortyTwoId;
            }

            // Download and save avatar if user doesn't have one
            if (!user.avatar && externalAvatarUrl) {
              try {
                const localAvatarPath =
                  await avatarService.downloadAndSaveAvatar(
                    externalAvatarUrl,
                    user.id.toString()
                  );
                updates.avatar = localAvatarPath;
              } catch (error) {
                console.error(
                  "Failed to download avatar for existing user:",
                  error
                );
                // Continue without avatar
              }
            }

            if (Object.keys(updates).length > 0) {
              user = await userRepo.updateUser(user.id, updates);
            }
            return done(null, user);
          }

          // Create new user

          // Ensure we have a unique username
          if (!userData.username) {
            userData.username = userData.email
              ? userData.email.split("@")[0]
              : "user";
          }
          userData.username = await ensureUniqueUsername(userData.username);

          // Create user without password (OAuth user)
          const newUser = await userRepo.createUser({
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: userData.username,
            email: userData.email,
            avatar: null,
            fortyTwoId: userData.fortyTwoId,
            // No password for OAuth users
          });

          // Download and save avatar after user is created
          if (externalAvatarUrl && newUser.id) {
            try {
              const localAvatarPath = await avatarService.downloadAndSaveAvatar(
                externalAvatarUrl,
                newUser.id.toString()
              );
              // Update user with local avatar path
              const updatedUser = await userRepo.updateUser(newUser.id, {
                avatar: localAvatarPath,
              });
              return done(null, updatedUser);
            } catch (error) {
              console.error("Failed to download avatar for new user:", error);
              // Continue without avatar
              return done(null, newUser);
            }
          }

          return done(null, newUser);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  // 42 OAuth not configured - skipping strategy setup
}

export default passport;
