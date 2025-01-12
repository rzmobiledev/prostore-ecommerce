import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma} from "@/db/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import {compare} from "@/lib/encrypt"
import type { NextAuthConfig } from "next-auth";
import {type AdapterSession} from "@auth/core/adapters"
import {JWT} from "@auth/core/jwt"
import type {Session, User} from "@auth/core/types"
import {NextRequest, NextResponse} from "next/server"

type UserType = {
    id?: string
    name?: string | null
    email?: string
    role?: string
    image?: string
    sessionToken?: string
    expires?: Date
}

type CallBackSessionType = {
    session: {
        user: User & {role?: string}
    } & AdapterSession & {expires: string},
    user: User & {role?: string}
    token: JWT & {role?: string},
    trigger?: string
}

type JwtType = User & { role?: string}

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
                    const isMatch: boolean = await compare(
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
        async session({ session, token, user, trigger }: CallBackSessionType): Promise<Session> {
            session.user.id = token.sub!
            session.user.role = token.role
            session.user.name = token.name

            console.log(token)

            if(trigger === 'update'){
                session.user.name = user.name
            }
            return session
        },

        async jwt({token, user}: {token: JWT, user: JwtType}): Promise<JWT|null> {
            if(user) {
                token.role = user.role

                if(user.name === 'NO_NAME') {
                    token.name = user.email!.split('@')[0]
                    await prisma.user.update({
                        where: {id: user.id},
                        data: {name: token.name}
                    })
                }
            }
            return token
        },

        authorized({request}: {request: NextRequest}): NextResponse<unknown>|Response|boolean{
            if(!request.cookies.get('sessionCartId')){
                const sessionCartId: string = crypto.randomUUID()
                const newRequestHeaders = new Headers(request.headers)
                const response: NextResponse<unknown> = NextResponse.next({
                    request: {
                        headers: newRequestHeaders
                    }
                })
                response.cookies.set('sessionCartId', sessionCartId)
                return response
            } else{
                return true
            }
        }
    }
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)