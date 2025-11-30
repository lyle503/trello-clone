"use client";

import { useSignIn, useClerk, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { useState } from "react";
import { Loader } from "lucide-react";
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useRouter } from "next/navigation";

export default function GuestButton() {
  const { isLoaded, signIn } = useSignIn();
  const { setActive } = useClerk();

  const { isSignedIn } = useUser();

  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleGuestLogin = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: process.env.NEXT_PUBLIC_GUEST_USER!,
        password: process.env.NEXT_PUBLIC_GUEST_PASSWORD!,
      });
      await setActive({ session: result.createdSessionId });
      closeDialog();
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  function closeDialog() {
    const trigger = document.querySelector('[data-state="open"') as HTMLElement;
    if (trigger) trigger.click();
  }

  if (isSignedIn) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="text-xs sm:text-sm hover:cursor-pointer"
        >
          {isLoading ? <Loader /> : <span>Sign in as Guest user</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
        <DialogHeader>
          <DialogTitle>Sign in as Guest User</DialogTitle>
        </DialogHeader>
        <p className="my-4">
          For convenience, the guest login uses a shared demo account so users
          can explore features quickly. Since other visitors may also use this
          account, you might see sample data or user-generated content that I
          did not create.
        </p>
        <Button
          variant="default"
          size="sm"
          className="text-xs sm:text-sm hover:cursor-pointer"
          onClick={handleGuestLogin}
          disabled={isLoading}
        >
          {isLoading ? <Loader /> : <span>Continue as Guest User</span>}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="text-xs sm:text-sm hover:cursor-pointer"
          onClick={closeDialog}
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}
