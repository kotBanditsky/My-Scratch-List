import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "../../../components/mongodb/mongo";
import { dbName } from "../../../components/mongodb/mongo";
import { createHash } from "crypto";

function hashSeed(seed) {
  return createHash("sha256").update(seed.trim().toLowerCase()).digest("hex");
}

export default NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Seed Phrase",
      credentials: {
        seed: { label: "Seed Phrase", type: "text" },
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const db = client.db(dbName);

        const seedHash = hashSeed(credentials.seed);

        const user = await db
          .collection("users")
          .findOne({ seedHash });

        if (!user) {
          throw new Error("Invalid seed phrase");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          username: user.username,
          role: user.role || "user",
        };
      },
    }),
  ],
  secret: process.env.SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user._id = token._id;
      session.user.username = token.username;
      session.user.role = token.role;
      return session;
    },
  },
});
