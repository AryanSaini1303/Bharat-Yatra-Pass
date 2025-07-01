'use client';
import { use, useEffect, useState } from 'react';
import styles from './page.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const [boatsAvailability, setBoatsAvailability] = useState([]);
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
  const searchParams = useSearchParams();
  const isVendorMode = searchParams.get('mode') === 'vendor';
  const userName = searchParams.get('userName');
  const [disablePayments, setDisablePayments] = useState(false);
  const [activeBoatingTickets, setActiveBoatingTickets] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [vendorAmount, setVendorAmount] = useState(0);
  const [adminAmount, setAdminAmount] = useState(0);

  const handleCheckout = async () => {
    setIsProcessing(true);
    const hasPublicSeats = ticketNum.some(
      (ticket) => !ticket.isBookedPrivate && ticket.booked > 0,
    );
    const hasPrivateBoats = ticketNum.some((ticket) => ticket.isBookedPrivate);
    if (!showFlag) {
      alert('Choose a time slot!');
      setIsProcessing(false);
      return;
    }
    if (!hasPublicSeats && !hasPrivateBoats) {
      alert('Select at least 1 seat or a private boat before checkout');
      setIsProcessing(false);
      return;
    }
    // if (verified === false) {
    //   alert('Please verify your phone number before proceeding to checkout.');
    //   setIsProcessing(false);
    //   return;
    // }
    try {
      const res1 = await fetch(`/api/fetchBoatingTickets`);
      const data1 = await res1.json();
      const sameTimeTickets = data1
        .filter(
          (item) =>
            new Date(item.dateTime).getTime() === new Date(dateTime).getTime(), // new Date(date) === new Date(date) does not equal so if we want to compare time then we have to use getTime() function
        )
        .map((item) => item.ticketNum)
        .flat();
      if (sameTimeTickets.length !== 0) {
        for (const ticket of ticketNum) {
          // here we are not using nested ".map" instead we are using "for" as if we return in a nested ".map" the it doesn't return the parent ".map"
          for (const same of sameTimeTickets) {
            if (ticket.name === same.name) {
              if (
                ticket.isBookedPrivate &&
                (same.isBookedPrivate || same.booked > 0)
              ) {
                alert(
                  `Private boat ${ticket.name} has just been booked by someone else. Please adjust your selection.`,
                );
                setFetchAgain(true);
                setIsProcessing(false);
                return;
              } else if (!ticket.isBookedPrivate && ticket.booked > 0) {
                if (same.isBookedPrivate) {
                  alert(
                    `${ticket.name} has just been privately booked by someone else. Please adjust your selection.`,
                  );
                  setFetchAgain(true);
                  setIsProcessing(false);
                  return;
                }
                const available = same.capacity - same.booked;
                if (ticket.booked > available) {
                  alert(
                    `Only ${available} seats are left for ${ticket.name}. Please adjust your selection.`,
                  );
                  setFetchAgain(true);
                  setIsProcessing(false);
                  return;
                }
              }
            }
          }
        }
      }
      if (disablePayments) {
        const referenceId = `BYP-${Date.now()}-${uuidv4().slice(0, 8)}`;
        setTicketId(referenceId);
      } else {
        handlePayment();
      }
    } catch (error) {
      console.error('Checkout validation error:', error);
      setIsProcessing(false);
      alert('Something went wrong. Please try again.');
    }
  };

  const sendOtp = async (phoneNumber) => {
    setSendingOtp(true);
    if (phoneNumber.startsWith('+91')) {
      phoneNumber = phoneNumber.slice(3); // Remove country code if present
    }
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      if (!response.ok) {
        // console.log(data);
        alert(data.error || 'Failed to send OTP');
        setSendingOtp(false);
        return false;
      }
      // console.log('OTP sent successfully:', data);
      setPhoneNumber(phoneNumber);
      setSendingOtp(false);
      return true; // Indicate success
    } catch (error) {
      // console.error('Error sending OTP:', error);
      setSendingOtp(false);
      return false; // Indicate failure
    }
  };

  const verifyOtp = async (code) => {
    try {
      setVerifyingOtp(true);
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, code }),
      });
      if (!response.ok) {
        throw new Error('Failed to verify OTP');
      }
      const data = await response.json();
      // console.log(data);
      if (data.error) {
        alert(data.error);
        setVerified(false);
        setVerifyingOtp(false);
        return false;
      }
      // console.log('OTP verified successfully:', data);
      alert('OTP verified successfully!');
      setVerifyingOtp(false);
      setVerified(true);
      return true;
    } catch (error) {
      // console.error('Error verifying OTP:', error);
      setVerified(false);
      setVerifyingOtp(false);
      return false;
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    const account = process.env.NEXT_PUBLIC_BOATING_VENDOR_ACCOUNT;
    try {
      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalAmount,
          vendorAmount,
          adminAmount,
          account,
        }), // sending amount to backend
      });
      const data = await response.json();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: totalAmount * 100,
        currency: 'INR',
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
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0, 0);
    // Round to nearest 30-min slot
    const currentMinutes = date.getMinutes();
    if (currentMinutes % 30 !== 0) {
      const roundedMinutes = currentMinutes <= 30 ? 30 : 0;
      if (roundedMinutes === 0) date.setHours(date.getHours() + 1);
      date.setMinutes(roundedMinutes);
    }
    return date;
  };

  useEffect(() => {
    // console.log(ticketId);
    if (!ticketId || !user?.id) return;
    // if (!ticketId) return;
    const saveTickets = async () => {
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
              service_provider_id: boats.id,
              service_provider: 'boating',
              origin: isVendorMode ? 'vendorPanel' : 'userPanel',
              // user_phone: phoneNumber,
              user_name: userName || user?.user_metadata?.full_name,
            },
          ])
          .select();
        if (error) {
          console.error('❌ Error saving ticket:', error.message);
          return;
        }
        if (data) {
          // console.log("✅ Ticket saved successfully:", data);
          if (disablePayments) {
            router.push(`/boating`);
          } else {
            router.push(`/ticket?q=${encodeURIComponent(ticketId)}`);
          }
        }
      } catch (err) {
        console.error('❌ Unexpected error:', err.message);
      }
    };
    saveTickets();
  }, [ticketId, user?.id, disablePayments]);
  // }, [ticketId]);
  // For now, inserting directly in the component works because Supabase’s Row-Level Security (RLS) applies stricter policies on API routes. When using useEffect, the request is made from the client-side with the authenticated user's session, ensuring the correct user_id is attached. This bypasses the "violating RLS policy" error that occurs when inserting via a Next.js API route (which may lack the necessary auth context).

  useEffect(() => {
    if (!fetchAgain) return;
    const fetchMonuments = async () => {
      try {
        const response = await fetch(
          `/api/fetchMonuments?detailed=${true}&id=${boatingId}&type=boating`,
        );
        const data = await response.json();
        const res1 = await fetch(`/api/fetchBoatingTickets?type=boating`);
        const data1 = await res1.json();
        setActiveBoatingTickets(
          data1.map((item) => ({
            data: item.ticketNum,
            timeSlot: item.dateTime,
          })),
        );
        setBoats(data[0]);
        setDisablePayments(isVendorMode && data[0].email === user?.email);
        setLoadingBoats(false);
        setFetchAgain(false);
      } catch (error) {
        console.error('Error fetching monuments:', error);
        setLoadingBoats(false);
      }
    };
    fetchMonuments();
  }, [fetchAgain, user]);

  useEffect(() => {
    if (showFlag && dateTime.length !== 0 && boats?.boats) {
      // console.log(activeBoatingTickets);
      // console.log(boats?.boats);
      // console.log(dateTime);
      const filteredData = activeBoatingTickets
        .filter(
          (item) =>
            new Date(item.timeSlot).getTime() === new Date(dateTime).getTime(),
        )
        .map((item) => ({ data: item.data }));
      // console.log(filteredData);
      const updatedBoats = boats?.boats
        .map((boat) => {
          let updatedBoat = { ...boat };
          filteredData.forEach((ticket) => {
            ticket.data.forEach((bookedBoat) => {
              if (bookedBoat.name === boat.name) {
                if (bookedBoat.booked > 0) {
                  updatedBoat.booked += bookedBoat.booked;
                }
                if (bookedBoat.isBookedPrivate) {
                  updatedBoat.isBookedPrivate = true;
                }
              }
            });
          });
          return updatedBoat;
        })
        .filter((boat) => !boat.isBookedPrivate);
      // console.log(updatedBoats);
      setBoatsAvailability(updatedBoats);
      setIsPrivateAvailable(() =>
        updatedBoats.some((item) => item.booked === 0 && !item.isBookedPrivate),
      ); // ".some" returns a boolean value, ".find" returns the first match, ".filter" returns array of all the matches
      setTicketNum(() =>
        updatedBoats.map((boat) => ({
          name: boat.name,
          booked: 0,
          isBookedPrivate: false,
          publicSeatPrice: boat.publicSeatPrice,
          privateBoatPrice: boat.privateBoatPrice,
          capacity: boat.capacity,
        })),
      );
      setLoadingBoats(false);
      setFetchAgain(false);
    }
  }, [showFlag, dateTime, boats, activeBoatingTickets]);
  // console.log(ticketNum);

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
    // Total public tickets
    const totalPublicTickets = Object.values(ticketNum).reduce(
      (acc, value) => acc + value.booked,
      0,
    );
    // Public seat prices
    const publicPrice = totalPublicTickets * boats.boats[0].publicSeatPrice;
    const adminPublicEarnings = totalPublicTickets * 100; // admin takes 100 rupees per public ticket
    // Private seat prices and earnings
    let privatePrice = 0;
    let adminPrivateEarnings = 0;
    ticketNum.forEach((ticket) => {
      if (ticket.isBookedPrivate) {
        const boat = boats.boats.find((b) => b.name === ticket.name);
        if (boat) {
          privatePrice += boat.privateBoatPrice;
          // Admin share per boat
          if (boat.name === 'Boat1') {
            adminPrivateEarnings += 500;
          } else if (boat.name === 'Boat2') {
            adminPrivateEarnings += 4000;
          }
        }
      }
    });
    const totalAmount = publicPrice + privatePrice;
    const adminAmount = adminPublicEarnings + adminPrivateEarnings;
    const vendorAmount = totalAmount - adminAmount;
    setTotalAmount(() => totalAmount);
    setAdminAmount(adminAmount);
    setVendorAmount(vendorAmount);
    // console.log({ totalAmount, adminAmount, vendorAmount });
  }, [ticketNum, boats]);

  if (loadingUser) {
    return <Loader margin={'15rem auto'} />;
  } else {
    if (!user) {
      return <div>Unauthenticated...</div>;
    }
  }

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
      ) : boats?.length != 0 ? (
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
                    const rawDate = new Date(date);
                    const newDate = (() => {
                      const d = new Date(date);
                      if (![0, 30].includes(d.getMinutes())) {
                        d.setMinutes(0);
                      }
                      if (
                        d.getHours() >
                        convertTime(boats.closing_time).getHours()
                      ) {
                        d.setHours(convertTime(boats.closing_time).getHours());
                      }
                      d.setSeconds(0);
                      return d;
                    })();
                    if (rawDate > new Date()) {
                      setDateTime(newDate);
                      setShowFlag(true);
                    }
                  }}
                  showTimeSelect
                  timeFormat="hh:mm aa"
                  timeIntervals={30}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="datepicker"
                  onCalendarOpen={() => setBlurFlag(true)}
                  onCalendarClose={() => setBlurFlag(false)}
                  minTime={
                    dateTime?.toDateString() === current_date.toDateString()
                      ? new Date() > convertTime(boats.opening_time)
                        ? new Date()
                        : convertTime(boats.opening_time)
                      : convertTime(boats.opening_time)
                  }
                  maxTime={convertTime(boats.closing_time)}
                  filterTime={(time) => {
                    const selectedDate = dateTime?.toDateString();
                    const isToday =
                      selectedDate === current_date.toDateString();
                    const isClosed =
                      new Date() > convertTime(boats.closing_time);
                    // Only restrict times if it's today and already closed
                    if (isToday && isClosed) return false;
                    return true;
                  }}
                  minDate={new Date()} // Here we are setting min. date of the calender to the current date i.e. new Date() as we don't want the user to book tickets for the past
                  customInput={
                    <button className={styles.datepicker_button}>
                      {showFlag && dateTime
                        ? dateTime.toLocaleString()
                        : 'Select Date & Time'}
                    </button>
                  }
                />
              </div>
            </section>
            {showFlag && boatsAvailability.length !== 0 ? (
              <section
                className={styles.ticketsSection}
                style={blurFlag ? { filter: 'blur(10px)' } : null}
              >
                {isPrivateAvailable && (
                  <>
                    <h3>Add a private boat</h3>
                    <div className={styles.tickets}>
                      {boatsAvailability.map((item, index, arr) => {
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
                <p>&#8377;{boatsAvailability[0].publicSeatPrice}/seat</p>
                <div className={styles.tickets}>
                  {boatsAvailability.map((item, index, arr) => (
                    <div
                      key={index}
                      style={
                        !ticketNum.some(
                          (ticket) =>
                            ticket.name === item.name &&
                            !ticket.isBookedPrivate,
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
                {/* {!verified && (
                  <section className={styles.otpSection}>
                    {phoneNumber.length === 0 ? (
                      <form
                        onSubmit={(e) => {
                          sendOtp(e.target.phoneNumber.value);
                          e.preventDefault();
                        }}
                        className={styles.phoneForm}
                      >
                        <label htmlFor="phoneNumber">
                          Enter Mobile Number:
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          name="phoneNumber"
                          id=""
                          required
                          maxLength="10"
                        />
                        <button disabled={sendingOtp}>
                          {sendingOtp ? 'Sending OTP...' : 'Submit'}
                        </button>
                      </form>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          verifyOtp(
                            Array.from(
                              { length: 6 },
                              (_, i) => e.target[`otp${i + 1}`].value,
                            ).join(''),
                          );
                        }}
                        className={styles.otpForm}
                      >
                        <label htmlFor="otp1">Enter OTP: </label>
                        <section>
                          {[...Array(6)].map((_, index) => (
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              name={`otp${index + 1}`}
                              key={index}
                              // maxLength="1"
                              required
                              onKeyDown={(e) => {
                                const previous =
                                  e.target.previousElementSibling;
                                if (
                                  e.key === 'Backspace' &&
                                  e.target.value === '' &&
                                  previous
                                ) {
                                  previous.focus();
                                }
                              }}
                              onChange={(e) => {
                                const value = e.target.value;
                                const form = e.target.form;
                                if (value.length > 1) {
                                  const chars = value.slice(0, 6).split('');
                                  chars.forEach((char, idx) => {
                                    const input = form[`otp${idx + 1}`];
                                    if (input) input.value = char;
                                  });
                                  const last = form[`otp${chars.length}`];
                                  if (last) last.focus();
                                } else {
                                  const next = e.target.nextElementSibling;
                                  const prev = e.target.previousElementSibling;
                                  if (value && next) next.focus();
                                  if (!value && prev) prev.focus();
                                }
                              }}
                              onPaste={(e) => {
                                e.preventDefault();
                                const pasteData = e.clipboardData
                                  .getData('text')
                                  .slice(0, 6)
                                  .split('');
                                pasteData.forEach((char, idx) => {
                                  const input = e.target.form[`otp${idx + 1}`];
                                  if (input) input.value = char;
                                });
                                const last =
                                  e.target.form[`otp${pasteData.length}`];
                                if (last) last.focus();
                              }}
                            />
                          ))}
                        </section>
                        <button disabled={verifyingOtp}>
                          {verifyingOtp ? 'Verifying...' : 'Verify'}
                        </button>
                      </form>
                    )}
                  </section>
                )} */}
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
            ) : (
              !loadingBoats &&
              showFlag && (
                <p style={blurFlag ? { filter: 'blur(10px)' } : null}>
                  No Boats are available for this time slot, please choose
                  another!
                </p>
              )
            )}
          </section>
          <button
            className={styles.checkout}
            style={blurFlag ? { filter: 'blur(10px)' } : null}
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

// You can't directly map() over an object, BUT you can convert it into an array using Object methods like:
// Object.entries() → Best for key-value pairs.
// Object.keys() → Best if you only need keys.
// Object.values() → Best if you only need values.
