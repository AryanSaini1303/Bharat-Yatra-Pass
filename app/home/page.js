"use client";
import { useState } from "react";
import styles from "./page.module.css";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const [profileClick, setProfileClick] = useState(false);
  if (status == "loading") return <div>Loading...</div>;
  if (status == "unauthenticated") return <div>Unauthenticated...</div>;
  return (
    // <div><h1>{session?.user?.name}</h1> <button onClick={()=>{signOut({callbackUrl:"/"})}}>Sign out</button></div>
    <div className="wrapper">
      <header className={styles.header}>
        <section className={styles.location}>
          <img src="/images/location.png" alt="" />
          <section className={styles.text}>
            <h5>Location</h5>
            <h4>New Delhi</h4>
          </section>
        </section>
        <section className={styles.profile}>
          {!profileClick ? (
            <img
              src="/images/profile.png"
              alt=""
              onClick={() => {
                setProfileClick(!profileClick);
              }}
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="2.5em"
              height="2.5em"
              onClick={() => {
                setProfileClick(!profileClick);
              }}
            >
              <path
                fill="currentColor"
                d="M19.1 4.9C15.2 1 8.8 1 4.9 4.9S1 15.2 4.9 19.1s10.2 3.9 14.1 0s4-10.3.1-14.2m-4.3 11.3L12 13.4l-2.8 2.8l-1.4-1.4l2.8-2.8l-2.8-2.8l1.4-1.4l2.8 2.8l2.8-2.8l1.4 1.4l-2.8 2.8l2.8 2.8z"
              ></path>
            </svg>
          )}
          {profileClick && (
            <ul className={styles.dropdown}>
              <li>
                <button>Current Tickets</button>
              </li>
              <li>
                <button>Past Tickets</button>
              </li>
              <li>
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  Log Out
                </button>
              </li>
            </ul>
          )}
        </section>
      </header>
    </div>
  );
}
