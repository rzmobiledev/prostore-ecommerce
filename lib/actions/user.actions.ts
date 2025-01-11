"use server"
import { signInFormSchema, signupFormSchema } from "@/lib/validators"
import {signIn, signOut} from "@/auth"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import {hashSync} from "bcrypt-ts-edge"
import {prisma} from "@/db/prisma"

type UserType = {
    name: string
    email: string
    password: string
    confirmPassword: string
}

export async function signInWithCredentials(prevState: unknown, formData: FormData): Promise<{success: boolean, message: string}>{
    try{
        const user = signInFormSchema.parse({
            email: formData.get("email"),
            password: formData.get("password")
        })

        await signIn('credentials', user)
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

export async function signUpUser(data: UserType)  {
    try{
        const user  = signupFormSchema.parse({
            name: data.name,
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword
        })

        user.password = hashSync(user.password, 10)
        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: user.password
            }
        })
        return Promise.resolve({message: 'User registered successfully'})

    }catch(error: unknown) {
        console.log(error)
        return Promise.reject({message: 'User was not registered'})
    }
}