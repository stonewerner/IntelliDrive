import Image from "next/image";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from 'next/link'


export default function Home() {
  return (
    <main className="">
      <div>
        <div className="p-10 flex flex-col bg-[#2B2929]
              dark:bg-slate-800 text-white space-y-5">
          <h1 className="text-5xl font-bold">
            Welcome to IntelliDrive. <br />
            <br />
            Storing everything for you and your academic needs. All in one place, supercharged by AI.
          </h1>
          <p className="pb-20">
            Enhance your personal storage with IntelliDrive, a fast, efficient, and AI-powered solution
            to upload, organize, search, and access files from anywhere.
            Securely store important documents and media, and experience the convenience of easy file management and sharing
            in one centralized AI-solution.
          </p>
          <Link href="/dashboard" className="flex cursor-pointer bg-blue-500 p-5 w-fit">
            Try it for free!
            <ArrowRight className="ml-10" />
          </Link>
        </div>
      </div>
      




    </main>
  );
}
