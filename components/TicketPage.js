"use client";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./TicketPage.module.css";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import Loader from "./loader";

export default function Ticket() {
  const searchParams = useSearchParams();
  const ticketId = decodeURIComponent(searchParams.get("q"));
  const [ticketDetails, setTicketDetails] = useState({});
  const [user, setUser] = useState();
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const dateObj = new Date(ticketDetails?.dateTime);
  const router = useRouter();
  const date = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: "true",
  });

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
          const { user } = session;
          setUser(user);
          setLoadingUser(false);
          //   console.log(user);
        } else {
          setLoadingUser(false);
          setUser(null);
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/fetchTicket?tickedId=${ticketId}`);
        const data = await response.json();
        setTicketDetails(data);
        setLoadingDetails(false);
      } catch (error) {
        console.error("Error fetching ticket:", error);
        setLoadingDetails(false);
      }
    };
    fetchTicket();
  }, []);

  if (loadingUser) {
    return <Loader margin={"15rem auto"} />;
  } else {
    if (!user) {
      return <div>Unauthenticated...</div>;
    }
  }

  return (
    <div
      className="wrapper"
      style={{ background: "linear-gradient(to bottom, white, white)" }}
    >
      <header className={styles.header}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="1.5em"
          height="1.5em"
          onClick={() => {
            router.back();
          }}
        >
          <path
            fill="currentColor"
            d="M16.88 2.88a1.25 1.25 0 0 0-1.77 0L6.7 11.29a.996.996 0 0 0 0 1.41l8.41 8.41c.49.49 1.28.49 1.77 0s.49-1.28 0-1.77L9.54 12l7.35-7.35c.48-.49.48-1.28-.01-1.77"
          ></path>
        </svg>
        <h2>Your Ticket</h2>
      </header>
      {loadingDetails ? (
        <Loader margin={"10rem auto"} />
      ) : ticketDetails.length == 0 ? (
        "No ticket found!"
      ) : (
        <div className={styles.ticketSectionContainer}>
          <section className={styles.ticketSection}>
            <div className={styles.borderCircle}></div>
            <div className={styles.borderCircle}></div>
            <div className={styles.borderCircle}></div>
            <div className={styles.borderCircle}></div>
            <img src={ticketDetails.monumentImage} alt="" />
            <h2>{ticketDetails.monumentName}</h2>
            <h3>{ticketDetails.monumentCity}</h3>
            <section className={styles.dateTime}>
              <h4>{date}</h4>
              <h4>{time}</h4>
            </section>
            {ticketDetails.ticketNum && (
              <ul>
                {ticketDetails.ticketNum.adult != 0 && (
                  <li>
                    Adult <span>x {ticketDetails.ticketNum.adult}</span>
                  </li>
                )}
                {ticketDetails.ticketNum.foreigner != 0 && (
                  <li>
                    Non &mdash; Indian{" "}
                    <span>x {ticketDetails.ticketNum.foreigner}</span>
                  </li>
                )}
                {ticketDetails.ticketNum.kid != 0 && (
                  <li>
                    Kid <span>x {ticketDetails.ticketNum.kid}</span>
                  </li>
                )}
                {ticketDetails.ticketNum.senior != 0 && (
                  <li>
                    Senior <span>x {ticketDetails.ticketNum.senior}</span>
                  </li>
                )}
              </ul>
            )}
            <div className={styles.separator}>
              <hr />
            </div>
            <section className={styles.info}>
              <QRCodeCanvas
                value={ticketId}
                size={140}
                bgColor="transparent"
                level="H"
              />
              <p>Ticked Id: {ticketId}</p>
              <div className={styles.status}>
                <h5>
                  {ticketDetails.status == "active" ? "Active" : "Expired"}
                </h5>
                <div
                  className={styles.statusCircle}
                  style={
                    ticketDetails.status == "active"
                      ? { backgroundColor: "green" }
                      : { backgroundColor: "red" }
                  }
                ></div>
              </div>
            </section>
          </section>
        </div>
      )}
    </div>
  );
}

// -- 🕒 Auto-Expire Old Tickets (Scheduled Job)
// -- -----------------------------------------
// -- This cron job runs every **minute** (`*/1 * * * *`) and updates tickets
// -- where `dateTime` has passed, setting `status = 'expired'`.
// --
// -- ✅ Why?
// -- - Keeps tickets **up-to-date** without manual updates.
// -- - Ensures **past tickets don’t stay valid**.
// -- - Runs **independently** of user actions.
// --
// -- ⏳ Schedule Options:
// -- - Every **minute** → `*/1 * * * *`
// -- - Every **hour** → `0 * * * *`
// --
// -- 📌 Set the Job:
// SELECT cron.schedule(
//   'update_expired_tickets',
//   '*/1 * * * *', -- Change to '0 * * * *' for hourly updates
//   $$ UPDATE tickets SET status = 'expired' WHERE dateTime < CURRENT_TIMESTAMP AND status != 'expired' $$
// );
