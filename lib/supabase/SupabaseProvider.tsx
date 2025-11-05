"use client";

// Required for Clerk / Supabase setup

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";

const Context = createContext<SupabaseContext>({
  supabase: null,
  isLoaded: false,
});

type SupabaseContext = {
  supabase: SupabaseClient | null;
  isLoaded: boolean;
};

export default function SupabaseProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { session } = useSession();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!session) return;
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        accessToken: async () => session?.getToken() ?? null,
      }
    );
    setSupabase(client);
    setIsLoaded(true);
  }, [session]);

  return (
    <Context.Provider value={{ supabase, isLoaded }}>
      {!isLoaded ? <div>Loading...</div> : children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context == undefined)
    throw new Error("useSupabase needs to be inside the provider");
  return context;
};
