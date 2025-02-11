import NextAuth from 'next-auth';
import { authConfig } from "./auth.config";
import { prisma } from "@/db/prisma";
import { cookies } from "next/headers";
import { compare } from "@/lib/encrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";


export const config: NextAuthConfig = {
    pages: {
        signIn: "/sign-in",
        error: "/sign-in",
    },

    session: {
        strategy: "jwt" as const,
        maxAge: 20 * 24 * 60 * 60, // 30 days
    },

    providers: [
      CredentialsProvider({
          credentials: {
              email: { type: "email"},
              password: { type: "password" },
          },

          async authorize(credentials){
              if(credentials === null) return null

              const user = await prisma.user.findFirst({
                  where: {email: credentials.email as string},
              })

              if(user && user.password){
                  const isMatch = await compare(credentials.password as string, user.password)
                  if(isMatch) return {
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      role: user.role
                  }
              }
              return null
          }
      })
    ],

    callbacks: {
        ...authConfig.callbacks,
        async session({session, token}){
            // set user id from token
            session.user.id = token.sub!
            session.user.role = token.role

            return session;
        },

        async jwt({token, user, trigger, session}) {
            // Assign user fields to token
            if(user){
                token.id = user.id
                token.role = user.role
            }
            // If user has no name then use the email
            if (user.name === "NO_NAME") {
                token.name = user.email!.split("@")[0];

                // Update database to reflect the token name
                await prisma.user.update({
                    where: { id: user.id },
                    data: { name: token.name },
                });
            }

            if (trigger === "signIn" || trigger === "signUp") {
                const cookiesObject = await cookies();
                const sessionCartId = cookiesObject.get("sessionCartId")?.value;

                if (sessionCartId) {
                    const sessionCart = await prisma.cart.findFirst({
                        where: { sessionCartId },
                    });

                    if (sessionCart) {
                        // Delete current user cart
                        await prisma.cart.deleteMany({
                            where: { userId: user.id },
                        });

                        // Assign new cart
                        await prisma.cart.update({
                            where: { id: sessionCart.id },
                            data: { userId: user.id },
                        });
                    }
                }
            }

            // Handle session updates
            if (session?.user.name && trigger === "update") {
                token.name = session.user.name;
            }
            return token;
        }
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth(config);