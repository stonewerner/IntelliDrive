import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import {
    ClerkProvider,
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
  } from '@clerk/nextjs'

function Header() {
  return (
    <header className="flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
            <div className="bg-[#0160FE] w-fit">
                <Image 
                    src="https://www.shareicon.net/download/2016/07/13/606936_dropbox_2048x2048.png"
                    alt="IntelliDrive"
                    className="invert"
                    height={50}
                    width={50}
                />
            </div>
            <h1  className="font-bold text-xl">IntelliDrive</h1>

        </Link>
        <div className="px-5 flex space-x-2 items-center">
            {/*Theme toggler, add aftersignouturl to clerkprovider and not the user button*/}
            <UserButton />

            <SignedOut>
                <SignInButton mode="modal" />
            </SignedOut>
        </div>


    </header>
  )
}

export default Header