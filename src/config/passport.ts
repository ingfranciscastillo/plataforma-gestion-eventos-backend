import "dotenv/config";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { db } from "./db/index.js";
import { users } from "./db/schema.js";
import { eq } from "drizzle-orm";

// Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Google profile"));
        }

        let user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user) {
          const [newUser] = await db
            .insert(users)
            .values({
              email,
              name: profile.displayName || "User",
              avatar: profile.photos?.[0]?.value,
              authProvider: "google",
              providerId: profile.id,
              isVerified: true,
            })
            .returning();
          user = newUser;
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Facebook OAuth
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
      profileFields: ["id", "emails", "name", "picture.type(large)"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Facebook profile"));
        }

        let user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user) {
          const [newUser] = await db
            .insert(users)
            .values({
              email,
              name: `${profile.name?.givenName} ${profile.name?.familyName}`,
              avatar: profile.photos?.[0]?.value,
              authProvider: "facebook",
              providerId: profile.id,
              isVerified: true,
            })
            .returning();
          user = newUser;
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export default passport;
