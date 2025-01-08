"use client"
import React from 'react'
import { APP_NAME } from "@/lib/constants"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Image src="/images/logo.svg" height={48} width={48} alt={`${APP_NAME} logo`} priority={true}/>
            <div className="p-6 rounded-lg shadow-md text-center w-1/3">
                <div className="text-3xl font-bold mb-4">Not Found</div>
                <p className="text-destructive">Could not find requested page</p>
                <Button variant="outline" className="mt-4 ml-2" onClick={() => (window.location.href="/")}>
                    Back to Home
                </Button>
            </div>
        </div>
    );
};

export default NotFound;