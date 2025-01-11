"use client"
import React from "react"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {
    Form,
    FormItem,
    FormField,
    FormLabel,
    FormMessage,
    FormControl
} from "@/components/ui/form"
import Link from "next/link"
import {signUpUser} from "@/lib/actions/user.actions";
import { signupFormSchema } from "@/lib/validators"
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation} from "@tanstack/react-query"
import {useToast } from "@/hooks/use-toast";

const SignUpForm = () => {
    const { mutate, isPending } = useMutation({
        mutationFn: signUpUser,
    });

    const { toast } = useToast()

    const form = useForm<z.infer<typeof signupFormSchema>>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    })

    const onSubmit = (values: z.infer<typeof signupFormSchema>) => {
        mutate(values, {
            onSuccess: (data: {message: string}) => {
                console.log(data)
                toast({
                    title: "Success",
                    description: data.message,
                    variant: "default"
                })

                form.reset()
            },
            onError: async error => {
                toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive"
                })
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                    Name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="John Doe"
                                        autoComplete="off"
                                        {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                    Email
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="john@example.com"
                                        autoComplete="off"
                                        {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                    Password
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="*********"
                                        autoComplete="off"
                                        {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                    Confirm Password
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="*********"
                                        autoComplete="off"
                                        {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <Button disabled={isPending} className="w-full" variant="default">
                        {
                            isPending ? 'Submitting...' : 'Sign Up'
                        }
                    </Button>
                    <div className="text-sm text-center text-muted-foreground">
                        Already have an account? {' '}
                        <Link href="/sign-in" target="_self" className="link">
                            Sign In
                        </Link>
                    </div>
                </div>
            </form>
        </Form>
    );
};

export default SignUpForm;