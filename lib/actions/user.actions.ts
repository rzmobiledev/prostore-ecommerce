"use server"
import { signInFormSchema } from "@/lib/validators"
import { signIn, signOut } from "@/auth"
import { isRedirectError } from "next/dist/client/components/redirect-error"

export async function signInWithCredentials(formData: FormData): Promise<{success: boolean, message: string}>{
    try{
        const user = signInFormSchema.parse({
            email: formData.get("email"),
            password: formData.get("password")
        })

        await signIn('credentials', { user })
        return { success: true, message: "Sign in successfully" }

    }catch(error){

      if(isRedirectError(error)){
          throw error
      }
      return { success: false, message: "Invalid email or password" }
    }
}

export async function signOutUser(): Promise<void> {
    await signOut()
}