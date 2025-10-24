"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { ArrowRight, Trello } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();

  const isDashboardPage = pathname === "/dashboard";
  const isBoardPage = pathname.startsWith("/boards/");

  if (isDashboardPage) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trello className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {" "}
              Trello Clone
            </span>
          </div>
          <div className="flex items-center gap-x-2 sm:gap-x-4">
            <UserButton />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trello className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          <span className="text-xl sm:text-2xl font-bold text-gray-900">
            {" "}
            Trello Clone
          </span>
        </div>
        <div className="flex items-center gap-x-2 sm:gap-x-4">
          <div>
            {isSignedIn ? (
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-y-1 sm:gap-y-0 sm:gap-x-4">
                <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Weclome,{" "}
                  {user.firstName ?? user.emailAddresses[0].emailAddress}
                </span>
                <Link href="/dashboard">
                  <Button size="sm" className="text-xs sm:text-sm">
                    Go to dashboard <ArrowRight />
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                <SignInButton>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm hover:cursor-pointer"
                  >
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button
                    size="sm"
                    className="text-xs sm:text-sm hover:cursor-pointer"
                  >
                    Sign up
                  </Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
