"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Noto_Sans } from "next/font/google";

const notoSans = Noto_Sans({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const [user, setUser] = useState("");

  const signIn = async (redirectPath = "/admin") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`,
        queryParams: {
          prompt: "select_account", // Forces google to always show account selection
        },
      },
    });

    if (error) {
      console.error("Authentication Error:", error);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
          const { user } = session;
          setUser(user);
          // console.log(user);
        } else {
          setUser(null);
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // useEffect(() => {
  //   user && window.location.replace("/home");
  // }, [user]);

  return (
    <div className="wrapper">
      <div className={styles.loginPage}>
        <div className={styles.content}>
          <header className={styles.header}>
            <h1>Welcome Back, Admin</h1>
            <h5>
            Securely access the control panel to manage users, tickets, and platform analytics. Your gateway to streamlined hiring and oversight.
            </h5>
          </header>
          <button
            onClick={() => signIn()}
            className={`${styles.googleLogin} ${notoSans.className}`}
          >
            <Image
              src={"/images/googleLogo.png"}
              width={30}
              height={30}
              alt="Google Logo"
            />
            <h3> Sign In With Google</h3>
          </button>
        </div>
        <img
          src="/images/background-mobile.png"
          alt="Background Monuments"
          className={styles.background}
        />
      </div>
    </div>
  );
}