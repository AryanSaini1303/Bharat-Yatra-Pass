"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const [profileClick, setProfileClick] = useState(false);
  const [location, setLocation] = useState("Udaipur");
  const dropdownRef = useRef(null); // React hook which is used to point to a div something like "document.getElementById"

  function handleSearch(e) {
    e.preventDefault();
    const monument = e.target.value;
    console.log("Searching for: ", monument);
  }

  useEffect(() => {
    if (profileClick && dropdownRef.current) {
      dropdownRef.current.focus();
    }
  }, [profileClick]);// Here what we are doing is we just check on every profileClick that if it's true then we autofocus that particular div to make the onBlur work properly later on as without this the dropdown gets visible but it isn't focused so we have to click on it to get focused then click anywhere else to trigger onBlur, that's why this autofocus is needed.

  if (status == "loading") return <div>Loading...</div>;
  if (status == "unauthenticated") return <div>Unauthenticated...</div>;
  return (
    <div className="wrapper">
      <header className={styles.header}>
        <section className={styles.location}>
          <img src="/images/location.png" alt="" />
          <section className={styles.text}>
            <h5>Location</h5>
            <h4>{location}</h4>
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
            <section className={styles.dropdown}>
              <ul
                tabIndex={0}
                ref={dropdownRef}
                onBlur={(e) => {
                  !dropdownRef.current.contains(e.relatedTarget) &&
                    setProfileClick(false);
                }} // Here we check onBlur if the click was on this div or not and if it's not then setProfileClick(false);
              >
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
            </section>
          )}
        </section>
      </header>
      <form
        className={styles.searchBar}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          type="text"
          name="monument"
          id=""
          placeholder="Rajgarh Fort"
          onChange={handleSearch}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="1.5em"
          height="1.5em"
        >
          <g fill="grey" fillRule="evenodd" clipRule="evenodd">
            <path d="M10.5 5.5a5 5 0 1 0 0 10a5 5 0 0 0 0-10m-6.5 5a6.5 6.5 0 1 1 13 0a6.5 6.5 0 0 1-13 0"></path>
            <path d="M14.47 14.47a.75.75 0 0 1 1.06 0l4 4a.75.75 0 1 1-1.06 1.06l-4-4a.75.75 0 0 1 0-1.06"></path>
          </g>
        </svg>
      </form>
    </div>
  );
}
