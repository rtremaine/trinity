import type { NextAuthConfig } from "next-auth";

export default {
  providers: [],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuthPage =
        nextUrl.pathname.startsWith("/signin") ||
        nextUrl.pathname.startsWith("/signup");

      if (isOnAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/admin")) {
        return isLoggedIn;
      }

      if (nextUrl.pathname.startsWith("/admin")) {
        return isLoggedIn && auth.user.role === "admin";
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.role) session.user.role = token.role as "user" | "admin";
      return session;
    },
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
