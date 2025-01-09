import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma} from "@/db/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import {compareSync} from "bcrypt-ts-edge/browser"
import type { NextAuthConfig } from "next-auth";
import {type AdapterSession, AdapterUser} from "@auth/core/adapters";
import {JWT} from "@auth/core/jwt";
import type {Session} from "@auth/core/types";

type UserType = {
    id?: string
    name?: string | null
    email?: string
    role?: string
    image?: string
    sessionToken?: string
    expires?: Date
}

type CallBackType = {
    session: {
        user: AdapterUser
    } & AdapterSession & {expires: string},
    user: AdapterUser
    token: JWT,
    trigger?: string
}

export const config = {
    pages: {
        signIn: '/sign-in',
        error: '/sign-in',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { type: 'email' },
                password: { type: 'password' }
            },
            async authorize(credentials: Partial<Record<"email"|"password", unknown>>): Promise<UserType|null> {
                if(credentials === null) return null

                const user = await prisma.user.findFirst({
                    where: {
                        email: credentials.email as string
                    }
                })

                if(user && user.password){
                    const isMatch: boolean = compareSync(
                        credentials.password as string,
                        user.password
                    )
                    if(isMatch) return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                    return null
                }
                return null
            }
        })
    ],
    callbacks: {
        async session({ session, token, user, trigger }: CallBackType): Promise<Session> {

            session.user.id = token.sub!
            if(trigger === 'update'){
                session.user.name = user.name
            }
            return session
        }
    }
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)