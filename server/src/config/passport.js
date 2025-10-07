import passport from "passport";
import { Strategy as FortyTwoStrategy } from "passport-42";
import { UserRepository } from "../repositories/userRepository.js";

const userRepo = new UserRepository();

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
        console.log("42 OAuth profile received:", profile);

        // Extract user data from profile
        const userData = {
          email: profile.emails?.[0]?.value || null,
          username: profile.username || profile.login || null,
          firstName: profile.name?.givenName || profile.first_name || null,
          lastName: profile.name?.familyName || profile.last_name || null,
          fortyTwoId: profile.id,
        };

        console.log("Extracted user data:", userData);

        // Check if user already exists by 42 ID or email
        let user = null;
        if (userData.fortyTwoId) {
          user = await userRepo.findByFortyTwoId(userData.fortyTwoId);
        }

        if (!user && userData.email) {
          user = await userRepo.findByEmail(userData.email);
        }

        if (user) {
          console.log("Existing user found:", user.id);
          // Update existing user with 42 data if needed
          if (!user.fortyTwoId && userData.fortyTwoId) {
            await userRepo.updateUser(user.id, {
              fortyTwoId: userData.fortyTwoId,
            });
          }
          return done(null, user);
        }

        // Create new user
        console.log("Creating new user from 42 OAuth");

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
          fortyTwoId: userData.fortyTwoId,
          // No password for OAuth users
        });

        console.log("New user created:", newUser.id);
        return done(null, newUser);
      } catch (error) {
        console.error("42 OAuth strategy error:", error);
        return done(error, null);
      }
    }
  )
);

export default passport;
