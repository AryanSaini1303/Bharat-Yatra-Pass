"use client";
import { useSearchParams } from "next/navigation";
import styles from "./TicketPage.module.css";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function Ticket() {
  const searchParams = useSearchParams();
  const ticketId = decodeURIComponent(searchParams.get("q"));
  const [ticketDetails, setTicketDetails] = useState({});
  const [user, setUser] = useState();
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const dateObj = new Date(ticketDetails?.dateTime);
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
    return <div>Loading...</div>;
  } else {
    if (!user) {
      return <div>Unauthenticated...</div>;
    }
  }

  return (
    <div className="wrapper">
      {loadingDetails ? (
        "loading..."
      ) : !ticketDetails ? (
        "No ticket found!"
      ) : (
        <section className={styles.ticketSection}>
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
          </section>
        </section>
      )}
    </div>
  );
}
