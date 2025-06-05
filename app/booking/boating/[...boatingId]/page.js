'use client';
import { use, useEffect, useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuidv4 } from 'uuid';
import Loader from '@/components/loader';
import Script from 'next/script';

export default function BookingPage({ params }) {
  const { boatingId } = use(params);
  const router = useRouter();
  const [boats, setBoats] = useState({});
  const [loadingBoats, setLoadingBoats] = useState(true);
  const [user, setUser] = useState();
  const [loadingUser, setLoadingUser] = useState(true);
  const [dateTime, setDateTime] = useState(new Date());
  const [blurFlag, setBlurFlag] = useState(false);
  const [ticketNum, setTicketNum] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const current_date = new Date();
  const [showFlag, setShowFlag] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [savingTicket, setSavingTicket] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isPrivateAvailable, setIsPrivateAvailable] = useState(true);
  const [fetchAgain, setFetchAgain] = useState(true);
  // console.log(user);

  const handleCheckout = async () => {
    setIsProcessing(true);
    const hasPublicSeats = ticketNum.some(
      (ticket) => !ticket.isBookedPrivate && ticket.booked > 0,
    );
    const hasPrivateBoats = ticketNum.some((ticket) => ticket.isBookedPrivate);
    if (!hasPublicSeats && !hasPrivateBoats) {
      alert('Select at least 1 seat or a private boat before checkout');
      setIsProcessing(false);
      return;
    }
    if (!showFlag) {
      alert('Choose a time slot!');
      setIsProcessing(false);
      return;
    }
    try {
      const res = await fetch(
        `/api/fetchMonuments?detailed=true&id=${boatingId}&type=boating`,
      );
      const [latestData] = (await res.json()) || [];
      for (const ticket of ticketNum) {
        const boat = latestData.boats.find((b) => b.name === ticket.name);
        if (!boat) continue;
        if (!ticket.isBookedPrivate && ticket.booked > 0) {
          const available = boat.capacity - boat.booked;
          if (ticket.booked > available) {
            alert(
              `Only ${available} seats are left for ${boat.name}. Please adjust your selection.`,
            );
            setFetchAgain(true);
            setIsProcessing(false);
            return;
          }
        }
        if (
          ticket.isBookedPrivate &&
          (boat.booked > 0 || boat.isBookedPrivate)
        ) {
          alert(
            `Private boat ${boat.name} has just been booked by someone else. Please adjust your selection.`,
          );
          setFetchAgain(true);
          setIsProcessing(false);
          return;
        }
      }
      handlePayment();
    } catch (error) {
      console.error('Checkout validation error:', error);
      setIsProcessing(false);
      alert('Something went wrong. Please try again.');
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ totalAmount }), // sending amount to backend
      });
      const data = await response.json();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: totalAmount * 100,
        current: 'INR',
        name: 'PERIMETER NETWORK PRIVATE LIMITED',
        description: 'This is a trasaction for the ticket',
        order_id: data.orderId,
        handler: function (response) {
          // console.log("Payment successful", response);
          setOrderId(response.razorpay_order_id);
          const referenceId = `BYP-${Date.now()}-${uuidv4().slice(0, 8)}`;
          setTicketId(referenceId);
        },
        prefill: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          contact: '8473651047',
        },
        theme: {
          color: '#3399cc',
        },
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error('Payment failed', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return date;
  };

  // You can't directly map() over an object, BUT you can convert it into an array using Object methods like:
  // Object.entries() → Best for key-value pairs.
  // Object.keys() → Best if you only need keys.
  // Object.values() → Best if you only need values.
  // function handleCheckout() {
  //   let breakFlag = false;
  //   for (let i = 0; i < Object.values(ticketNum).length; i++) {
  //     if (Object.values(ticketNum)[i] > 0) {
  //       breakFlag = true;
  //       break;
  //     }
  //     if (
  //       i == Object.values(ticketNum).length - 1 &&
  //       Object.values(ticketNum)[i] == 0
  //     ) {
  //       alert("Select at least 1 ticket before the checkout");
  //       return;
  //     }
  //   }
  //   if (breakFlag && !showFlag) {
  //     alert("Choose a time slot!");
  //     return;
  //   }
  //   const referenceId = `BYP-${Date.now()}-${uuidv4().slice(0, 8)}`;
  //   setTicketId(referenceId);
  // }

  const updateBoatingDatabase = async () => {
    try {
      const updatedBoats = boats.boats.map((boat) => {
        const ticket = ticketNum.find((t) => t.name === boat.name);
        if (!ticket) return boat;
        if (ticket.isBookedPrivate) {
          return {
            ...boat,
            isBookedPrivate: true,
            booked: 0, // just in case public was booked before
          };
        }
        if (ticket.booked > 0) {
          return {
            ...boat,
            booked: boat.booked + ticket.booked,
          };
        }
        return boat;
      });
      const { data, error } = await supabase
        .from('boating')
        .update({ boats: updatedBoats })
        .eq('id', boatingId)
        .select();
      if (error) throw error;
      console.log('Database updated:', data);
    } catch (err) {
      console.error('Update error:', err);
      setIsProcessing(false);
      alert('Failed to update boating data. Please try again.');
    }
  };

  useEffect(() => {
    // console.log(ticketId);
    if (!ticketId || !user?.id) return;
    // if (!ticketId) return;
    const saveTickets = async () => {
      updateBoatingDatabase();
      try {
        const { data, error } = await supabase
          .from('tickets')
          .insert([
            {
              monumentName: boats.name,
              monumentCity: boats.city,
              monumentImage: boats.image_url,
              dateTime: dateTime,
              ticketId,
              ticketNum,
              user_id: user.id,
              status: 'active',
            },
          ])
          .select();
        if (error) {
          console.error('❌ Error saving ticket:', error.message);
          return;
        }
        if (data) {
          // console.log("✅ Ticket saved successfully:", data);
          router.push(`/ticket?q=${encodeURIComponent(ticketId)}&type=boating`);
        }
      } catch (err) {
        console.error('❌ Unexpected error:', err.message);
      }
    };
    saveTickets();
    // }, [ticketId, user?.id]);
  }, [ticketId]);
  // For now, inserting directly in the component works because Supabase’s Row-Level Security (RLS) applies stricter policies on API routes. When using useEffect, the request is made from the client-side with the authenticated user's session, ensuring the correct user_id is attached. This bypasses the "violating RLS policy" error that occurs when inserting via a Next.js API route (which may lack the necessary auth context).

  useEffect(() => {
    if (!fetchAgain) return;
    const fetchMonuments = async () => {
      try {
        const response = await fetch(
          `/api/fetchMonuments?detailed=${true}&id=${boatingId}&type=boating`,
        );
        const data = await response.json();
        const boats = data[0].boats.filter((item) => !item.isBookedPrivate); // if a boat is booked privately then it won't available for private booking or public seats booking either
        setBoats(() => ({ ...data[0], boats: boats }));
        setIsPrivateAvailable(() =>
          data[0].boats.some((item) => item.booked === 0 && !item.isBookedPrivate),
        ); // ".some" returns a boolean value, ".find" returns the first match, ".filter" returns array of all the matches
        setTicketNum(() =>
          boats.map((boat) => ({
            name: boat.name,
            booked: 0,
            isBookedPrivate: false,
            publicSeatPrice: boat.publicSeatPrice,
            privateBoatPrice: boat.privateBoatPrice,
          })),
        );
        setLoadingBoats(false);
        setFetchAgain(false);
      } catch (error) {
        console.error('Error fetching monuments:', error);
        setLoadingBoats(false);
      }
    };
    fetchMonuments();
  }, [fetchAgain]);
  // console.log(boats);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
          const { user } = session;
          setUser(user);
          setLoadingUser(false);
          //   console.log(user);
        } else {
          setLoadingUser(false);
          setUser(null);
        }
      },
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (Object.keys(boats).length === 0) return;
    const publicPrice =
      Object.values(ticketNum).reduce((acc, value) => acc + value.booked, 0) *
      boats.boats[0].publicSeatPrice;
    const privatePrice = ticketNum.reduce((sum, ticket) => {
      if (ticket.isBookedPrivate) {
        const boat = boats.boats.find((b) => b.name === ticket.name);
        return sum + (boat?.privateBoatPrice || 0);
      }
      return sum;
    }, 0);
    setTotalAmount(() => publicPrice + privatePrice);
  }, [ticketNum, boats]);

  if (loadingUser) {
    return <Loader margin={'15rem auto'} />;
  } else {
    if (!user) {
      return <div>Unauthenticated...</div>;
    }
  }

  // console.log(ticketNum);
  // console.log(privateTicketNum);
  // console.log(ticketNum);

  return (
    <div
      className="wrapper"
      style={orderId || isProcessing ? { pointerEvents: 'none' } : null}
    >
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
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
      {loadingBoats ? (
        <Loader margin={'10rem auto'} />
      ) : boats.length != 0 ? (
        <div className={styles.container}>
          <img
            src={boats.image_url}
            alt="Monument Image"
            style={blurFlag ? { filter: 'blur(10px)' } : null}
          />
          <section
            className={styles.info}
            style={blurFlag ? { filter: 'blur(10px)' } : null}
          >
            <section>
              <h3>About {boats.name}</h3>
              <p>{boats.description}</p>
            </section>
            <section>
              <h3>Address</h3>
              <p>{boats.address}</p>
            </section>
            <section className={styles.timings}>
              <h3>Opening Hours</h3>
              <div>
                <p>
                  Opening Time:
                  <span>
                    {(() => {
                      const [hours, minutes] = boats.opening_time.split(':');
                      const date = new Date();
                      date.setHours(hours, minutes);
                      return date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      });
                    })()}
                  </span>
                </p>

                <p>
                  Closing Time:
                  <span>
                    {(() => {
                      const [hours, minutes] = boats.closing_time.split(':');
                      const date = new Date();
                      date.setHours(hours, minutes);
                      return date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
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
              <h3 style={blurFlag ? { filter: 'blur(10px)' } : null}>
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
                    new Date() > convertTime(boats.closing_time)
                      ? convertTime(boats.closing_time) // Disable all slots
                      : new Date() > convertTime(boats.opening_time) &&
                        current_date.toDateString() === dateTime.toDateString()
                      ? new Date() // Allow selection from current time onwards if within hours
                      : convertTime(boats.opening_time) // Default to opening time
                  }
                  maxTime={
                    current_date.toDateString() === dateTime.toDateString() &&
                    new Date() > convertTime(boats.closing_time)
                      ? convertTime(boats.closing_time) // Disable all slots
                      : convertTime(boats.closing_time)
                  }
                  minDate={new Date()} // Here we are setting min. date of the calender to the current date i.e. new Date() as we don't want the user to book tickets for the past
                  customInput={
                    <button className={styles.datepicker_button}>
                      {dateTime.toLocaleString() && showFlag
                        ? dateTime.toLocaleString()
                        : 'Select Date & Time'}
                    </button>
                  }
                />
              </div>
            </section>
            <section
              className={styles.ticketsSection}
              style={blurFlag ? { filter: 'blur(10px)' } : null}
            >
              {isPrivateAvailable && (
                <>
                  <h3>Add a private boat</h3>
                  <div className={styles.tickets}>
                    {boats.boats.map((item, index, arr) => {
                      if (item.booked > 0) return;
                      return (
                        <div key={index}>
                          <div>
                            <section
                              style={
                                !ticketNum.some(
                                  (ticket) =>
                                    ticket.name === item.name &&
                                    ticket.booked === 0,
                                )
                                  ? { pointerEvents: 'none', opacity: 0.5 }
                                  : null
                              }
                            >
                              <div className={styles.ticketInfo}>
                                <h1>{item.name}</h1>
                                <p>{item.capacity} seater</p>
                                <h4>&#8377;{item.privateBoatPrice}</h4>
                              </div>
                              <div className={styles.counter}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 14 14"
                                  width="1.6em"
                                  height="1.6em"
                                  onClick={() => {
                                    setTicketNum((prev) =>
                                      prev.map((boat) =>
                                        boat.name === item.name
                                          ? {
                                              ...boat,
                                              isBookedPrivate:
                                                !boat.isBookedPrivate,
                                              booked: !boat.isBookedPrivate
                                                ? 0
                                                : boat.booked,
                                            }
                                          : boat,
                                      ),
                                    );
                                  }}
                                  style={
                                    ticketNum.some(
                                      (ticket) =>
                                        ticket.name === item.name &&
                                        ticket.isBookedPrivate,
                                    )
                                      ? {
                                          transform: 'rotate(45deg)',
                                          color: 'red',
                                        }
                                      : null
                                  }
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
                          {arr.length - 1 !== index && <hr />}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              <h3>Add a public seat</h3>
              <p>&#8377;{boats.boats[0].publicSeatPrice}/seat</p>
              <div className={styles.tickets}>
                {boats.boats.map((item, index, arr) => (
                  <div
                    key={index}
                    style={
                      !ticketNum.some(
                        (ticket) =>
                          ticket.name === item.name && !ticket.isBookedPrivate,
                      )
                        ? { opacity: 0.5, pointerEvents: 'none' }
                        : null
                    }
                  >
                    <div>
                      <section>
                        <div className={styles.ticketInfo}>
                          <h1>{item.name}</h1>
                          <p>
                            Available seats: {item.capacity - item.booked}/
                            {item.capacity}
                          </p>
                        </div>
                        <div className={styles.counter}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 48 48"
                            width="1.6em"
                            height="1.6em"
                            style={
                              ticketNum.find(
                                (ticket) =>
                                  ticket.booked <= 0 &&
                                  ticket.name == item.name,
                              )
                                ? { pointerEvents: 'none', opacity: '0.5' }
                                : null
                            }
                            onClick={() => {
                              setTicketNum((prev) =>
                                prev.map((boat) =>
                                  boat.name === item.name
                                    ? {
                                        ...boat,
                                        booked:
                                          boat.booked - 1 <= 0
                                            ? 0
                                            : boat.booked - 1,
                                      }
                                    : boat,
                                ),
                              );
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
                          <h1>
                            {ticketNum.find(
                              (ticket) => ticket.name === item.name,
                            ).booked || 0}
                          </h1>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 14 14"
                            width="1.6em"
                            height="1.6em"
                            onClick={() => {
                              setTicketNum((prev) =>
                                prev.map((boat) =>
                                  boat.name === item.name
                                    ? {
                                        ...boat,
                                        booked:
                                          boat.booked + 1 >=
                                          item.capacity - item.booked
                                            ? item.capacity - item.booked
                                            : boat.booked + 1,
                                        isBookedPrivate: false,
                                      }
                                    : boat,
                                ),
                              );
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
                    {arr.length - 1 !== index && <hr />}
                  </div>
                ))}
              </div>

              <section className={styles.timings}>
                <h3>Summary</h3>
                <div>
                  <p>
                    Public seats:
                    <span>
                      &#8377;
                      {Object.values(ticketNum).reduce(
                        (acc, value) => acc + value.booked,
                        0,
                      ) * boats.boats[0].publicSeatPrice}
                      {/*taking "publicSeatPrice" of first boat as all boats have same "publicSeatPrice" */}
                    </span>
                  </p>
                  <p>
                    Private Boat:
                    <span>
                      &#8377;
                      {ticketNum.reduce((sum, ticket) => {
                        if (ticket.isBookedPrivate) {
                          const boat = boats.boats.find(
                            (b) => b.name === ticket.name,
                          );
                          return sum + (boat?.privateBoatPrice || 0);
                        }
                        return sum;
                      }, 0)}
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
            style={blurFlag ? { filter: 'blur(10px)' } : null}
            // onClick={handleCheckout}
            onClick={handleCheckout}
          >
            {isProcessing ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      ) : (
        'No Monument Found!'
      )}
    </div>
  );
}
