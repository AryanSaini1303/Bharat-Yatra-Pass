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
  const [user, setUser]=useState('');

  const signIn = async (redirectPath = "/home") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`,
        queryParams:{
          prompt:"select_account" // Forces google to always show account selection
        }
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

  useEffect(()=>{
    user&&window.location.replace("/home");
  },[user])

  return (
    <div className="wrapper">
      <div className={styles.loginPage}>
        <div className={styles.content}>
          <header className={styles.header}>
            <h2>Welcome to</h2>
            <h1>Bharat Yatra Pass</h1>
            <h5>
              Seamless ticket booking for India&apos;s iconic monuments &ndash;
              Fast, Secure, and Hassle-Free!
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
