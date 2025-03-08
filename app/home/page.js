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
          <img
            src="/images/profile.png"
            alt=""
            onClick={() => {
              setProfileClick(!profileClick);
            }}
          />
          {profileClick && (
            <ul className={styles.dropdown}>
              <li>
                <button>Current Tickets</button>
              </li>
              <li>
                <button>Past Tickets</button>
              </li>
              <li>
                <button onClick={(()=>{signOut({callbackUrl:"/"})})}>Log Out</button>
              </li>
            </ul>
          )}
        </section>
      </header>
    </div>
  );
}
