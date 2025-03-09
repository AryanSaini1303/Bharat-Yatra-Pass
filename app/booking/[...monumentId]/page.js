"use client";
import { use, useEffect, useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BookingPage({ params }) {
  const { monumentId } = use(params);
  const router = useRouter();
  const [monument, setMonument] = useState({});
  const [loadingMonument, setLoadingMonument] = useState(true);
  const [user, setUser] = useState();
  const [loadingUser, setLoadingUser] = useState(true);
  const [dateTime, setDateTime] = useState(new Date());
  const [blurFlag, setBlurFlag] = useState(false);

  useEffect(() => {
    const fetchMonuments = async () => {
      try {
        const response = await fetch(
          `/api/fetchMonuments?detailed=${true}&id=${monumentId}`
        );
        const data = await response.json();
        setMonument(data[0]);
        // console.log(data[0]);
        setLoadingMonument(false);
      } catch (error) {
        console.error("Error fetching monuments:", error);
        setLoadingMonument(false);
      }
    };
    fetchMonuments();
  }, []);

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
      <header className={styles.header}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="1.8em"
          height="1.8em"
          onClick={() => {
            router.back();
          }}
        >
          <path
            fill="currentColor"
            d="M16.88 2.88a1.25 1.25 0 0 0-1.77 0L6.7 11.29a.996.996 0 0 0 0 1.41l8.41 8.41c.49.49 1.28.49 1.77 0s.49-1.28 0-1.77L9.54 12l7.35-7.35c.48-.49.48-1.28-.01-1.77"
          ></path>
        </svg>
        <h2>Details</h2>
      </header>
      {loadingMonument ? (
        "Loading..."
      ) : monument.length != 0 ? (
        <div className={styles.container}>
          <img src={monument.image_url} alt="Monument Image" style={blurFlag?{filter:"blur(10px)"}:null}/>
          <section className={styles.info} style={blurFlag?{filter:"blur(10px)"}:null}>
            <section>
              <h3>About {monument.name}</h3>
              <p>{monument.description}</p>
            </section>
            <section>
              <h3>Address</h3>
              <p>{monument.address}</p>
            </section>
            <section className={styles.timings}>
              <h3>Opening Hours</h3>
              <div>
                <p>
                  Opening Time:
                  <span>
                    {(() => {
                      const [hours, minutes] = monument.opening_time.split(":");
                      const date = new Date();
                      date.setHours(hours, minutes);
                      return date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      });
                    })()}
                  </span>
                </p>

                <p>
                  Closing Time:
                  <span>
                    {(() => {
                      const [hours, minutes] = monument.closing_time.split(":");
                      const date = new Date();
                      date.setHours(hours, minutes);
                      return date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      });
                    })()}
                  </span>
                </p>
              </div>
            </section>
          </section>
          <section className={styles.booking}>
            <section>
              <h3 style={blurFlag?{filter:"blur(10px)"}:null}>Book a slot</h3>
              <div className={styles.dateTimePicker}>
                <DatePicker
                  selected={dateTime}
                  onChange={(date) => setDateTime(date)}
                  showTimeSelect
                  timeFormat="hh:mm aa"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="datepicker"
                  onCalendarOpen={() => setBlurFlag(true)} // Trigger when the popper opens
                  onCalendarClose={() => setBlurFlag(false)} // Trigger when the popper closes
                />
              </div>
            </section>
            {/* <section>
                <h3>Add Travelers</h3>
            </section> */}
          </section>
        </div>
      ) : (
        "No Monument Found!"
      )}
    </div>
  );
}
