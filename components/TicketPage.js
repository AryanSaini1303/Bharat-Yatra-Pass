"use client";
import { useSearchParams } from "next/navigation";
import styles from "./TicketPage.module.css"
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function Ticket() {
  const searchParams = useSearchParams();
  const tickets = JSON.parse(decodeURIComponent(searchParams.get("tickets")));
  const [user, setUser] = useState();
  const [loadingUser, setLoadingUser] = useState(true);
//   const totalAmount = JSON.parse(
//     decodeURIComponent(searchParams.get("totalAmount"))
//   );
  const monumentDetails = JSON.parse(
    decodeURIComponent(searchParams.get("monumentDetails"))
  );
  const ticketId = JSON.parse(decodeURIComponent(searchParams.get("ticketId")));
  const qrValue = JSON.parse(decodeURIComponent(searchParams.get("qrValue")));
  const ticketColor = JSON.parse(
    decodeURIComponent(searchParams.get("ticketColor"))
  );
  const dateObj = new Date(tickets.dateTime);
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

  if (loadingUser) {
    return <div>Loading...</div>;
  } else {
    if (!user) {
      return <div>Unauthenticated...</div>;
    }
  }

  return (
    <div className="wrapper">
      <section
        className={styles.ticketSection}
        style={{ backgroundColor: `${ticketColor}` }}
      >
        <img src={monumentDetails.image_url} alt="" />
        <h2>{monumentDetails.name}</h2>
        <h3>{monumentDetails.city}</h3>
        <section className={styles.dateTime}>
          <h4>{date}</h4>
          <h4>{time}</h4>
        </section>
        <ul>
          {tickets.ticketNum.adult != 0 && (
            <li>
              Adult <span>x {tickets.ticketNum.adult}</span>
            </li>
          )}
          {tickets.ticketNum.foreigner != 0 && (
            <li>
              Non &mdash; Indian <span>x {tickets.ticketNum.foreigner}</span>
            </li>
          )}
          {tickets.ticketNum.kid != 0 && (
            <li>
              Kid <span>x {tickets.ticketNum.kid}</span>
            </li>
          )}
          {tickets.ticketNum.senior != 0 && (
            <li>
              Senior <span>x {tickets.ticketNum.senior}</span>
            </li>
          )}
        </ul>
        <div className={styles.separator}>
          <hr />
        </div>
        <section className={styles.info}>
          <QRCodeCanvas
            value={qrValue}
            size={140}
            bgColor="transparent"
            level="H"
          />
          <p>Ticked Id: {ticketId}</p>
        </section>
      </section>
    </div>
  );
}
