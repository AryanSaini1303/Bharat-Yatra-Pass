"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { Noto_Sans } from "next/font/google";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

const notoSans = Noto_Sans({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const { data: session } = useSession();
  console.log(session);
  useEffect(()=>{
    session&&window.location.replace("/home");
  },[session])
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
            onClick={() => signIn("google")}
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
          alt=""
          className={styles.background}
        />
      </div>
    </div>
  );
}
