"use client";
import { use, useEffect, useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { v4 as uuidv4 } from "uuid";

export default function BookingPage({ params }) {
  const { monumentId } = use(params);
  const router = useRouter();
  const [monument, setMonument] = useState({});
  const [loadingMonument, setLoadingMonument] = useState(true);
  const [user, setUser] = useState();
  const [loadingUser, setLoadingUser] = useState(true);
  const [dateTime, setDateTime] = useState(new Date());
  const [blurFlag, setBlurFlag] = useState(false);
  const [ticketNum, setTicketNum] = useState({
    senior: 0,
    kid: 0,
    adult: 0,
    foreigner: 0,
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const current_date = new Date();
  const [showFlag, setShowFlag] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [ticketColor, setTicketColor] = useState("");

  const convertTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return date;
  };

  // You can't directly map() over an object, BUT you can convert it into an array using Object methods like:
  // Object.entries() → Best for key-value pairs.
  // Object.keys() → Best if you only need keys.
  // Object.values() → Best if you only need values.
  function handleCheckout() {
    let breakFlag = false;
    for (let i = 0; i < Object.values(ticketNum).length; i++) {
      if (Object.values(ticketNum)[i] > 0) {
        breakFlag = true;
        break;
      }
      if (
        i == Object.values(ticketNum).length - 1 &&
        Object.values(ticketNum)[i] == 0
      ) {
        alert("Select at least 1 ticket before the checkout");
        return;
      }
    }
    if (breakFlag && !showFlag) {
      alert("Choose a time slot!");
      return;
    }
    const referenceId = `BYP-${Date.now()}-${uuidv4().slice(0, 8)}`;
    setTicketId(referenceId);
    setQrValue(referenceId);
    setTicketColor(() => {
      let color;
      do {
        color = `#${Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")}`;
      } while (
        color.toLowerCase() === "#000000" ||
        color.toLowerCase() === "#ffffff"
      );
      return color
    });
  }

  useEffect(() => {
    const queryParams = new URLSearchParams({
      tickets: encodeURIComponent(JSON.stringify({ ticketNum, dateTime })),
      // totalAmount: encodeURIComponent(JSON.stringify(totalAmount)),
      monumentDetails: encodeURIComponent(JSON.stringify(monument)),
      ticketId: encodeURIComponent(JSON.stringify(ticketId)),
      qrValue: encodeURIComponent(JSON.stringify(qrValue)),
      ticketColor: encodeURIComponent(
        JSON.stringify(ticketColor)
      ),
    });
    ticketId.length != 0 && router.push(`/ticket?${queryParams}`);
  }, [ticketId]);

  useEffect(() => {
    monument.ticket_price &&
      setTotalAmount(
        ticketNum.foreigner * monument.ticket_price.foreigner +
          ticketNum.senior * monument.ticket_price.senior +
          ticketNum.kid * monument.ticket_price.child +
          ticketNum.adult * monument.ticket_price.adult
      );
  }, [ticketNum, monument]);

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
        <h2>Details</h2>
      </header>
      {loadingMonument ? (
        "Loading..."
      ) : monument.length != 0 ? (
        <div className={styles.container}>
          <img
            src={monument.image_url}
            alt="Monument Image"
            style={blurFlag ? { filter: "blur(10px)" } : null}
          />
          <section
            className={styles.info}
            style={blurFlag ? { filter: "blur(10px)" } : null}
          >
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
              <h3 style={blurFlag ? { filter: "blur(10px)" } : null}>
                Book a slot
              </h3>
              <div className={styles.dateTimePicker}>
                <DatePicker
                  selected={dateTime}
                  onChange={(date) => {
                    setDateTime(date);
                    setShowFlag(true);
                  }}
                  showTimeSelect
                  timeFormat="hh:mm aa"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="datepicker"
                  onCalendarOpen={() => setBlurFlag(true)} // Trigger when the popper opens
                  onCalendarClose={() => setBlurFlag(false)} // Trigger when the popper closes
                  minTime={
                    // If today’s date matches selected date & current time has passed closing time, disable all time slots
                    current_date.toDateString() === dateTime.toDateString() &&
                    new Date() > convertTime(monument.closing_time)
                      ? convertTime(monument.closing_time) // Disable all slots
                      : new Date() > convertTime(monument.opening_time) &&
                        current_date.toDateString() === dateTime.toDateString()
                      ? new Date() // Allow selection from current time onwards if within hours
                      : convertTime(monument.opening_time) // Default to opening time
                  }
                  maxTime={
                    current_date.toDateString() === dateTime.toDateString() &&
                    new Date() > convertTime(monument.closing_time)
                      ? convertTime(monument.closing_time) // Disable all slots
                      : convertTime(monument.closing_time)
                  }
                  minDate={new Date()} // Here we are setting min. date of the calender to the current date i.e. new Date() as we don't want the user to book tickets for the past
                  customInput={
                    <button className={styles.datepicker_button}>
                      {dateTime.toLocaleString() && showFlag
                        ? dateTime.toLocaleString()
                        : "Select Date & Time"}
                    </button>
                  }
                />
              </div>
            </section>
            <section
              className={styles.ticketsSection}
              style={blurFlag ? { filter: "blur(10px)" } : null}
            >
              <h3>Add Travelers</h3>
              <div className={styles.tickets}>
                <section>
                  <div className={styles.ticketInfo}>
                    <h1>Senior Citizen</h1>
                    <h4>&#8377;{monument.ticket_price.senior}</h4>
                  </div>
                  <div className={styles.counter}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="1.6em"
                      height="1.6em"
                      style={
                        ticketNum.senior <= 0
                          ? { pointerEvents: "none", opacity: "0.5" }
                          : null
                      }
                      onClick={() => {
                        setTicketNum((prev) => ({
                          ...prev,
                          senior: prev.senior - 1 <= 0 ? 0 : prev.senior - 1,
                        }));
                      }}
                    >
                      <path
                        fill="currentColor"
                        d="M6.5 24c0-9.665 7.835-17.5 17.5-17.5S41.5 14.335 41.5 24S33.665 41.5 24 41.5S6.5 33.665 6.5 24M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20s20-8.954 20-20S35.046 4 24 4M14 24c0-.69.56-1.25 1.25-1.25h17.5a1.25 1.25 0 1 1 0 2.5h-17.5c-.69 0-1.25-.56-1.25-1.25"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.2"
                      ></path>
                    </svg>
                    <h1>{ticketNum.senior}</h1>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 14 14"
                      width="1.6em"
                      height="1.6em"
                      onClick={() => {
                        setTicketNum((prev) => ({
                          ...prev,
                          senior: prev.senior + 1,
                        }));
                      }}
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="7" cy="7" r="6.5"></circle>
                        <path d="M7 4v6M4 7h6"></path>
                      </g>
                    </svg>
                  </div>
                </section>
                <hr />
                <section>
                  <div className={styles.ticketInfo}>
                    <h1>Kids</h1>
                    <h4>&#8377;{monument.ticket_price.child}</h4>
                  </div>
                  <div className={styles.counter}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="1.6em"
                      height="1.6em"
                      style={
                        ticketNum.kid <= 0
                          ? { pointerEvents: "none", opacity: "0.5" }
                          : null
                      }
                      onClick={() => {
                        setTicketNum((prev) => ({
                          ...prev,
                          kid: prev.kid - 1 <= 0 ? 0 : prev.kid - 1,
                        }));
                      }}
                    >
                      <path
                        fill="currentColor"
                        d="M6.5 24c0-9.665 7.835-17.5 17.5-17.5S41.5 14.335 41.5 24S33.665 41.5 24 41.5S6.5 33.665 6.5 24M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20s20-8.954 20-20S35.046 4 24 4M14 24c0-.69.56-1.25 1.25-1.25h17.5a1.25 1.25 0 1 1 0 2.5h-17.5c-.69 0-1.25-.56-1.25-1.25"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.2"
                      ></path>
                    </svg>
                    <h1>{ticketNum.kid}</h1>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 14 14"
                      width="1.6em"
                      height="1.6em"
                      onClick={() => {
                        setTicketNum((prev) => ({
                          ...prev,
                          kid: prev.kid + 1,
                        }));
                      }}
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="7" cy="7" r="6.5"></circle>
                        <path d="M7 4v6M4 7h6"></path>
                      </g>
                    </svg>
                  </div>
                </section>
                <hr />
                <section>
                  <div className={styles.ticketInfo}>
                    <h1>Adult</h1>
                    <h4>&#8377;{monument.ticket_price.adult}</h4>
                  </div>
                  <div className={styles.counter}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="1.6em"
                      height="1.6em"
                      style={
                        ticketNum.adult <= 0
                          ? { pointerEvents: "none", opacity: "0.5" }
                          : null
                      }
                      onClick={() => {
                        setTicketNum((prev) => ({
                          ...prev,
                          adult: prev.adult - 1 <= 0 ? 0 : prev.adult - 1,
                        }));
                      }}
                    >
                      <path
                        fill="currentColor"
                        d="M6.5 24c0-9.665 7.835-17.5 17.5-17.5S41.5 14.335 41.5 24S33.665 41.5 24 41.5S6.5 33.665 6.5 24M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20s20-8.954 20-20S35.046 4 24 4M14 24c0-.69.56-1.25 1.25-1.25h17.5a1.25 1.25 0 1 1 0 2.5h-17.5c-.69 0-1.25-.56-1.25-1.25"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.2"
                      ></path>
                    </svg>
                    <h1>{ticketNum.adult}</h1>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 14 14"
                      width="1.6em"
                      height="1.6em"
                      onClick={() => {
                        setTicketNum((prev) => ({
                          ...prev,
                          adult: prev.adult + 1,
                        }));
                      }}
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="7" cy="7" r="6.5"></circle>
                        <path d="M7 4v6M4 7h6"></path>
                      </g>
                    </svg>
                  </div>
                </section>
                <hr />
                <section>
                  <div className={styles.ticketInfo}>
                    <h1>{"(Non - Indians)"}</h1>
                    <h4>&#8377;{monument.ticket_price.foreigner}</h4>
                  </div>
                  <div className={styles.counter}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="1.6em"
                      height="1.6em"
                      style={
                        ticketNum.foreigner <= 0
                          ? { pointerEvents: "none", opacity: "0.5" }
                          : null
                      }
                      onClick={() => {
                        setTicketNum((prev) => ({
                          ...prev,
                          foreigner:
                            prev.foreigner - 1 <= 0 ? 0 : prev.foreigner - 1,
                        }));
                      }}
                    >
                      <path
                        fill="currentColor"
                        d="M6.5 24c0-9.665 7.835-17.5 17.5-17.5S41.5 14.335 41.5 24S33.665 41.5 24 41.5S6.5 33.665 6.5 24M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20s20-8.954 20-20S35.046 4 24 4M14 24c0-.69.56-1.25 1.25-1.25h17.5a1.25 1.25 0 1 1 0 2.5h-17.5c-.69 0-1.25-.56-1.25-1.25"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.2"
                      ></path>
                    </svg>
                    <h1>{ticketNum.foreigner}</h1>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 14 14"
                      width="1.6em"
                      height="1.6em"
                      onClick={() => {
                        setTicketNum((prev) => ({
                          ...prev,
                          foreigner: prev.foreigner + 1,
                        }));
                      }}
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="7" cy="7" r="6.5"></circle>
                        <path d="M7 4v6M4 7h6"></path>
                      </g>
                    </svg>
                  </div>
                </section>
              </div>
              <section className={styles.timings}>
                <h3>Summary</h3>
                <div>
                  <p>
                    Senior Citizen tickets:
                    <span>
                      &#8377;{ticketNum.senior * monument.ticket_price.senior}
                    </span>
                  </p>
                  <p>
                    Kid tickets:
                    <span>
                      &#8377;{ticketNum.kid * monument.ticket_price.child}
                    </span>
                  </p>
                  <p>
                    Adult tickets:
                    <span>
                      &#8377;{ticketNum.adult * monument.ticket_price.adult}
                    </span>
                  </p>
                  <p>
                    Non - Indian tickets:
                    <span>
                      &#8377;
                      {ticketNum.foreigner * monument.ticket_price.foreigner}
                    </span>
                  </p>
                  <p className={styles.totalAmount}>
                    Total payable amount:
                    <span>
                      &#8377;
                      {totalAmount}
                    </span>
                  </p>
                </div>
              </section>
            </section>
          </section>
          <button
            className={styles.checkout}
            style={blurFlag ? { filter: "blur(10px)" } : null}
            onClick={handleCheckout}
          >
            Checkout
          </button>
        </div>
      ) : (
        "No Monument Found!"
      )}
    </div>
  );
}
