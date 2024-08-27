import Image from "next/image";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

export default function Home() {
  return (
    <main className="">
      <h1>IntelliDrive</h1>
      <UserButton />
    </main>
  );
}
