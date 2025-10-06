import passport from "passport";
import { Strategy as FortyTwoStrategy } from "passport-42";
import { UserRepository } from "../repositories/userRepository.js";


passport.use(
  new FortyTwoStrategy(
    {
      clientID: process.env.FORTY_TWO_CLIENT_ID,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET,
      callbackURL: process.env.FORTY_TWO_CALLBACK_URL,
      scope: ["public"],
    },
    async (profile, done) => {
        console.log({profile})
        
    }
  )
);

export default passport;
