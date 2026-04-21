import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // Pass the ID token or access token to the client for backend calls
        (session as any).idToken = token.id_token;
        (session as any).backendToken = token.backendToken;
        if (token.user) {
             (session as any).user = { ...session.user, ...token.user };
        } else {
             (session as any).user.id = token.sub;
        }
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.id_token = account.id_token;
        
        // Call backend login
        try {
          const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
          const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: account.id_token }),
          });
          if (res.ok) {
            const data = await res.json();
            token.backendToken = data.token;
            token.user = data.user;
          } else {
            console.error("Backend login failed", await res.text());
          }
        } catch (e) {
          console.error("Backend login error", e);
        }
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
});

export { handler as GET, handler as POST };
