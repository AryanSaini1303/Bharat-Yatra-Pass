"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Noto_Sans } from "next/font/google";
import axios from "axios";

const notoSans = Noto_Sans({
  weight: "400",
  subsets: ["latin"],
});

const isValidSSOAccessToken = async (token) => {
  const serverUrl = "https://keycloak.mogiio.com"; // ✅ Fixed URL
  const realmName = "udaipurinsider";
  const url = `${serverUrl}/realms/${realmName}/protocol/openid-connect/userinfo`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      console.log("✅ Token successfully validated");
      return { status: true, data: response.data };
    } else {
      return { status: false, message: "❌ Unexpected status code" };
    }
  } catch (error) {
    console.log("⚠️ Error during token validation:", error?.response?.data || error.message);
    return { status: false, message: "❌ Token validation failed" };
  }
};


export default function Home() {
  const [user, setUser] = useState("");
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("token");
    // console.log(accessToken);
    // console.log(window.location.href);

    if (accessToken) {
      setToken(accessToken);
      // console.log(accessToken);
      isValidSSOAccessToken(accessToken)
        .then((response) => {
          if (response.status) {
            console.log("Token is valid");
            // Perform any action you need with the valid token
          } else {
            console.error("Invalid token");
            // Handle invalid token case
          }
        })
        .catch((error) => {
          console.error("Error validating token:", error);
        });
    } else {
      console.warn("No token found in URL");
    }
  }, []);

  const signIn = async (redirectPath = "/home") => {
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

  useEffect(() => {
    user && window.location.replace("/home");
  }, [user]);

  return (
    <div className="wrapper">
      <div className={styles.loginPage}>
        <div className={styles.content}>
          <header className={styles.header}>
            <p>{token}</p>
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
