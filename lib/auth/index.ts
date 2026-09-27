import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validation/auth";
import { getAdminEmail, isAdminEmail, isAdminPassword } from "@/lib/auth/admin-credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // The administrator is authenticated only against ADMIN_EMAIL / ADMIN_PASSWORD from env.
        // A database row is kept (with an unusable password hash) so products and activity can reference it.
        if (isAdminEmail(email)) {
          if (!isAdminPassword(password)) return null;
          const adminEmail = getAdminEmail()!;
          const admin = await prisma.user.upsert({
            where: { email: adminEmail },
            update: { role: "ADMIN", passwordHash: "!env-managed" },
            create: { name: "ESell Admin", email: adminEmail, role: "ADMIN", passwordHash: "!env-managed" },
          });
          return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
        }

        const user = await prisma.user.findFirst({ where: { email: { equals: email.trim(), mode: "insensitive" } } });
        // Any other ADMIN row (e.g. an older seeded admin) can no longer sign in with a stored password.
        if (!user || user.role === "ADMIN") return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: "USER" | "ADMIN" }).role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
  },
});
