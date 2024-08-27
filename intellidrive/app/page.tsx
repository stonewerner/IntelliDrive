import Image from "next/image";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="">
      <h1>IntelliDrive</h1>
      <Button variant={"secondary"}>My Demo Button</Button>
    </main>
  );
}
