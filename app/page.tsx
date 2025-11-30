import GuestButton from "@/components/guestbutton";
import Navbar from "@/components/navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <main>
        <div className="flex flex-col items-center pt-50">
          <h1 className="text-5xl my-5">Welcome to TrelloClone</h1>
          <p>
            A website built with{" "}
            <a href="https://nextjs.org/" target="_blank">
              Next.js
            </a>{" "}
            and{" "}
            <a href="https://supabase.com/" target="_blank">
              Supabase
            </a>
            , using TypeScript and TailwindCSS
          </p>
          <p className="text-xs my-5">built by Lyle Frankgate</p>
        </div>
        <div className="flex flex-col justify-center items-center my-12">
          <GuestButton />
        </div>
      </main>
    </div>
  );
}
