import passport from "passport";
import { Strategy as FortyTwoStrategy } from "passport-42";
import { UserService } from "../services/userService.js";

const userService = new UserService();

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
        const user = await userService.createOrUpdateUserFrom42(profile);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
