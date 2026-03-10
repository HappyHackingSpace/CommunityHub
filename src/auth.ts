import NextAuth, { type DefaultSession, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: string[];
      tenantId?: string | null;
    } & DefaultSession["user"];
    accessToken: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Backend Token",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;
        
        // In a real app we'd decode the JWT to get the user ID/email/roles here,
        // but for now we just return a shell object because our API client will 
        // use the token to fetch `/users/me` on the client side if needed.
        // We'll trust the token passed from our backend redirect.
        
        try {
          // A very basic JWT decode without verification (backend already verified Google)
          const base64Url = (credentials.token as string).split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );
          
          const decoded = JSON.parse(jsonPayload);
          
          return {
            id: decoded.sub,
            email: decoded.email,
            roles: decoded.roles || [],
            tenantId: decoded.tenantId || null,
            accessToken: credentials.token,
          } as any;
          
        } catch (e) {
          console.error("Failed to decode token", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as any).roles;
        token.tenantId = (user as any).tenantId;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];
        session.user.tenantId = token.tenantId as string | null;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Optional: where to redirect if auth fails
  },
});