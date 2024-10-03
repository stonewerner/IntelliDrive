import Image from "next/image";
import Link from "next/link";
import React from "react";
import { SignInButton, SignedOut, UserButton } from "@clerk/nextjs";
import { ThemeToggler } from "./ThemeToggler";

function Header() {
    return (
        <header className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
                <div className="bg-[#0160FE] w-fit">
                    <Image
                        src="/ai-cloud.png"
                        alt="IntelliDrive"
                        className=""
                        height={50}
                        width={50}
                    />
                </div>
                <h1 className="font-bold text-xl">IntelliDrive</h1>
            </Link>
            <div className="px-5 flex space-x-4 items-center">
                {/*add aftersignouturl to clerkprovider and not the user button*/}
                <nav className="flex space-x-4 items-center">
                    <Link
                        href="/chat"
                        className="text-md font-medium hover:underline"
                    >
                        CHAT
                    </Link>
                    <Link
                        href="/dashboard"
                        className="text-md font-medium hover:underline"
                    >
                        DASHBOARD
                    </Link>
                </nav>
                <ThemeToggler />
                <UserButton />

                <SignedOut>
                    <SignInButton mode="modal" />
                </SignedOut>
            </div>
        </header>
    );
}

export default Header;
