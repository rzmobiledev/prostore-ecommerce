"use server"
import { shippingAddressSchema, signInFormSchema, signupFormSchema } from '@/lib/validators';
import { auth, signIn, signOut } from '@/auth';
import { isRedirectError } from "next/dist/client/components/redirect-error"
import {hash} from "@/lib/encrypt"
import {prisma} from "@/db/prisma"
import { ShippingAddress, User } from '@/types';
import { formatError } from '@/lib/utils';

type UserType = {
    name: string
    email: string
    password: string
    confirmPassword: string
}

const toastResponse = (success: boolean, message: string) : {success: boolean, message: string} => {
    return {
        success: success,
        message: message
    }
}

export async function signInWithCredentials(prevState: unknown, formData: FormData): Promise<{success: boolean, message: string}>{
    try{
        const user = signInFormSchema.parse({
            email: formData.get("email"),
            password: formData.get("password")
        })

        await signIn('credentials', user)
        return toastResponse(true, "Sign in successfully")

    }catch(error){
      if(isRedirectError(error)){
          throw error
      }
      return toastResponse(false, "Invalid email or password")
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

        user.password = await hash(user.password)
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

export async function getUserById(userId: string): Promise<User|null> {
    try{
        const user: User = await prisma.user.findFirst({
            where: {
                id: userId
            }
        }) as User
        return Promise.resolve(user)
    }catch(error){
        console.log(error)
        return Promise.reject({message: 'User not found'})
    }
}

export async function updateUserAddress(data: ShippingAddress) {
    try{
        const session = await auth()
        const currentUser = await prisma.user.findFirst({
            where: { id: session?.user?.id}
        })
        if(!currentUser) throw new Error("User not found")

        const address: ShippingAddress = shippingAddressSchema.parse(data)
        await prisma.user.update({
            where: {id: currentUser?.id},
            data: {address}
        })

        return toastResponse(true, "User updated successfully")

    }catch(error){
        return toastResponse(false, formatError(error))
    }
}