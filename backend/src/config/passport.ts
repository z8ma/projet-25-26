import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './prisma.js';

export function configurePassport() {
  console.log('[Passport Config] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 30) + '...');
  console.log('[Passport Config] GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET?.substring(0, 15) + '...');

  // Serialize user ID into session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientID || !clientSecret) {
    console.warn('[Passport Config] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set - Google OAuth disabled');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with this Google ID
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          if (user) {
            // Update tokens
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleAccessToken: accessToken,
                googleRefreshToken: refreshToken || user.googleRefreshToken,
              },
            });
            return done(null, user);
          }

          // Check if user exists with this email
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // Link Google account to existing user
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: profile.id,
                googleAccessToken: accessToken,
                googleRefreshToken: refreshToken,
              },
            });
            return done(null, user);
          }

          // User doesn't exist - we'll handle creation in the controller
          // to allow them to choose their role
          return done(null, {
            googleId: profile.id,
            email,
            accessToken,
            refreshToken,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            isNewUser: true,
          } as any);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}
