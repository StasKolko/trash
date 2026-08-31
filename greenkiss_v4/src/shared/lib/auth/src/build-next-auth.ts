import NextAuth from "next-auth";
import { buildAdapter } from "./build-adapter";
import { buildProviders } from "./build-providers";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: buildAdapter(),
  providers: buildProviders(),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (!session.user) session.user = {} as typeof session.user;
      session.user.role = token.role;
      return session;
    },
  },
});
