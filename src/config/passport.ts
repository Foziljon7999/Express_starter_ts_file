import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();
const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_REDIRECT_URL as string,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (user) {
          return done(null, user);
        }

        user = await prisma.user.create({
          data: {
            googleId: profile.id,
            displayName: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`,
            firstName: profile.name?.givenName || "",
            lastName: profile.name?.familyName || "",
            email: profile.emails?.[0].value || "",
            photo: profile.photos?.[0].value || "",
            provider: 'google'
          },
        });

        return done(null, user);
      } catch (err) {
        console.error(err);
        return done(err, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
