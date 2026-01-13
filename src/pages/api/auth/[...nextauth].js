import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const baseURL = process.env.NEXT_PUBLIC_API_PATH;

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log('Google Sign In:', { user, account, profile });

        // Send Google user data to your existing backend API
        const response = await fetch(`${baseURL}/auth/google-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: account.providerAccountId,
            accessToken: account.access_token,
          }),
        });

        const data = await response.json();

        if (data.status) {
          // Store backend response data in the token for later use
          user.backendToken = data.token;
          user.backendUser = data.user;
          user.sessionData = data;
          return true;
        } else {
          console.error('Backend authentication failed:', data.message);
          return false;
        }
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    async jwt({ token, account, user }) {
      // Persist backend data to the token right after signin
      if (user?.backendToken) {
        token.backendToken = user.backendToken;
        token.backendUser = user.backendUser;
        token.sessionData = user.sessionData;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      // Send backend data to the client
      session.backendToken = token.backendToken;
      session.backendUser = token.backendUser;
      session.sessionData = token.sessionData;
      session.accessToken = token.accessToken;
      session.provider = token.provider;
      return session;
    },
  },
  pages: {
    // signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}

export default NextAuth(authOptions)