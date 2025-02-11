import type { NextAuthConfig } from "next-auth";
import {NextRequest} from 'next/server';
import { Session } from '@auth/core/types';
import { NextResponse } from "next/server";

export const authConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
    authorized({request, auth}: {request: NextRequest, auth: Session|null}){
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ]

      const { pathname } = request.nextUrl;
      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

      if (!request.cookies.get("sessionCartId")) {
        const sessionCartId = crypto.randomUUID();

        const response = NextResponse.next({
          request: {
            headers: new Headers(request.headers),
          },
        });

        response.cookies.set("sessionCartId", sessionCartId);
        return response;
      }

      return true;
    }
  }
} satisfies NextAuthConfig;