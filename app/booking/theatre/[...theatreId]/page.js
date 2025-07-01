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
  const { theatreId } = use(params);
  const router = useRouter();
  const [theatre, setTheaters] = useState({});
  const [theatreAvailability, setTheatreAvailability] = useState({});
  const [loadingTheatre, setLoadingTheatre] = useState(true);
  const [user, setUser] = useState();
  const [loadingUser, setLoadingUser] = useState(true);
  const [dateTime, setDateTime] = useState(new Date());
  const [blurFlag, setBlurFlag] = useState(false);
  const [ticketNum, setTicketNum] = useState({});
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
  const [activeTheatreTickets, setActiveTheatreTickets] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [vendorAmount, setVendorAmount] = useState(0);
  const [adminAmount, setAdminAmount] = useState(0);

  const handleCheckout = async () => {
    setIsProcessing(true);
    const hasSeats = ticketNum.booked > 0;
    if (!showFlag) {
      alert('Choose a time slot!');
      setIsProcessing(false);
      return;
    }
    if (!hasSeats) {
      alert('Select at least 1 seat before checkout');
      setIsProcessing(false);
      return;
    }
    // if (verified === false) {
    //   alert('Please verify your phone number before proceeding to checkout.');
    //   setIsProcessing(false);
    //   return;
    // }

    try {
      const res1 = await fetch(`/api/fetchBoatingTickets?type=theatre`);
      const data1 = await res1.json();
      const totalBooked = data1.reduce((acc, item) => {
        const itemTime = normalizeDate(item.dateTime);
        const selectedTime = normalizeDate(dateTime);
        return itemTime === selectedTime ? acc + item.ticketNum.booked : acc;
      }, 0);
      if (ticketNum.booked > ticketNum.capacity - totalBooked) {
        alert(
          'Oops! A few of the seats you selected were just booked by someone else.\nPlease update your selection before proceeding.',
        );
        setFetchAgain(true);
        setIsProcessing(false);
        return;
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
    const account = process.env.NEXT_PUBLIC_THEATRE_VENDOR_ACCOUNT;
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

  const normalizeDate = (dt) => new Date(dt).toISOString().slice(0, 16); // ISO up to minutes

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
              monumentName: theatre.name,
              monumentCity: theatre.city,
              monumentImage: theatre.image_url,
              dateTime: dateTime,
              ticketId,
              ticketNum,
              user_id: user.id,
              status: 'active',
              service_provider_id: theatre.id,
              service_provider: 'theatre',
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
            router.push(`/theatre`);
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
    const fetchTheatre = async () => {
      try {
        const response = await fetch(
          `/api/fetchMonuments?detailed=${true}&id=${theatreId}&type=theatres`,
        );
        const data = await response.json();
        const res1 = await fetch(`/api/fetchBoatingTickets?type=theatre`);
        const data1 = await res1.json();
        // console.log(data1);
        setActiveTheatreTickets(
          data1.map((item) => ({
            data: item.ticketNum,
            timeSlot: item.dateTime,
          })),
        );
        setTheaters(data[0]);
        setDisablePayments(isVendorMode && data[0].email === user?.email);
        setLoadingTheatre(false);
        setFetchAgain(false);
      } catch (error) {
        console.error('Error fetching monuments:', error);
        setLoadingTheatre(false);
      }
    };
    fetchTheatre();
  }, [fetchAgain, user]);
  // console.log(activeTheatreTickets);

  useEffect(() => {
    if (showFlag && dateTime.length !== 0 && theatre) {
      const price = theatre.ticket_price.price;
      const capacity = theatre.ticket_price.capacity;
      const name = theatre.name;
      setTicketNum(() => ({
        booked: 0,
        price,
        capacity,
        name,
      }));
      const totalBooked = activeTheatreTickets.reduce((acc, item) => {
        const itemTime = normalizeDate(item.timeSlot);
        const selectedTime = normalizeDate(dateTime);
        return itemTime === selectedTime ? acc + item.data.booked : acc;
      }, 0);
      setTheatreAvailability(() => ({
        booked: totalBooked,
        price,
        capacity,
        name,
      }));
      setLoadingTheatre(false);
      setFetchAgain(false);
    }
  }, [showFlag, dateTime, theatre, activeTheatreTickets]);

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
    if (Object.keys(theatre).length === 0) return;
    const totalAmount = ticketNum.booked * ticketNum.price;
    const adminAmount = ticketNum.booked * 100; // admin takes 100 rupees per ticket
    const vendorAmount = totalAmount - adminAmount;
    setTotalAmount(() => totalAmount);
    setAdminAmount(adminAmount);
    setVendorAmount(vendorAmount);
    // console.log({ totalAmount, adminAmount, vendorAmount });
  }, [ticketNum, theatre]);

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
      {loadingTheatre ? (
        <Loader margin={'10rem auto'} />
      ) : theatre?.length != 0 ? (
        <div className={styles.container}>
          <img
            src={theatre.image_url}
            alt="Monument Image"
            style={blurFlag ? { filter: 'blur(10px)' } : null}
          />
          <section
            className={styles.info}
            style={blurFlag ? { filter: 'blur(10px)' } : null}
          >
            <section>
              <h3>About {theatre.name}</h3>
              <p>{theatre.description}</p>
            </section>
            <section>
              <h3>Address</h3>
              <p>{theatre.address}</p>
            </section>
            <section className={styles.timings}>
              <h3>Opening Hours</h3>
              <div>
                <p>
                  Opening Time:
                  <span>
                    {(() => {
                      const [hours, minutes] = theatre.opening_time.split(':');
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
                      const [hours, minutes] = theatre.closing_time.split(':');
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
                      if (![0].includes(d.getMinutes())) {
                        d.setMinutes(0);
                      }
                      if (
                        d.getHours() >
                        convertTime(theatre.opening_time).getHours()
                      ) {
                        d.setHours(
                          convertTime(theatre.opening_time).getHours(),
                        );
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
                  timeIntervals={60}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="datepicker"
                  onCalendarOpen={() => setBlurFlag(true)}
                  onCalendarClose={() => setBlurFlag(false)}
                  minTime={
                    dateTime?.toDateString() === current_date.toDateString()
                      ? new Date() > convertTime(theatre.opening_time)
                        ? new Date()
                        : convertTime(theatre.opening_time)
                      : convertTime(theatre.opening_time)
                  }
                  maxTime={convertTime(theatre.opening_time)} // i've added maxTime as opening_time too as we have a one hour slot and there's only one slot in the whole day
                  filterTime={(time) => {
                    const selectedDate = dateTime?.toDateString();
                    const isToday =
                      selectedDate === current_date.toDateString();
                    const isClosed =
                      new Date().getTime() >
                      convertTime(theatre.opening_time).getTime();
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
            {showFlag &&
            theatreAvailability.capacity - theatreAvailability.booked !== 0 ? (
              <section
                className={styles.ticketsSection}
                style={blurFlag ? { filter: 'blur(10px)' } : null}
              >
                <h3>Add a public seat</h3>
                <p>&#8377;{theatreAvailability.price}/seat</p>
                <div className={styles.tickets}>
                  {Object.keys(theatreAvailability).length !== 0 && (
                    <div>
                      <div>
                        <section>
                          <div className={styles.ticketInfo}>
                            <h1>{theatreAvailability.name}</h1>
                            <p>
                              Available seats:{' '}
                              {theatreAvailability.capacity -
                                theatreAvailability.booked}
                              /{theatreAvailability.capacity}
                            </p>
                          </div>
                          <div className={styles.counter}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 48 48"
                              width="1.6em"
                              height="1.6em"
                              style={
                                ticketNum.booked <= 0
                                  ? { pointerEvents: 'none', opacity: '0.5' }
                                  : null
                              }
                              onClick={() => {
                                setTicketNum((prev) => ({
                                  ...prev,
                                  booked:
                                    prev.booked - 1 <= 0 ? 0 : prev.booked - 1,
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
                            <h1>{ticketNum.booked || 0}</h1>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 14 14"
                              width="1.6em"
                              height="1.6em"
                              style={
                                ticketNum.booked >=
                                theatreAvailability.capacity -
                                  theatreAvailability.booked
                                  ? { pointerEvents: 'none', opacity: '0.5' }
                                  : null
                              }
                              onClick={() => {
                                setTicketNum((prev) => ({
                                  ...prev,
                                  booked:
                                    prev.booked + 1 >=
                                    theatreAvailability.capacity -
                                      theatreAvailability.booked
                                      ? theatreAvailability.capacity -
                                        theatreAvailability.booked
                                      : prev.booked + 1,
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
                    </div>
                  )}
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
                      Seats:
                      <span>
                        &#8377;
                        {ticketNum.booked * ticketNum.price}
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
              !loadingTheatre &&
              showFlag && (
                <p style={blurFlag ? { filter: 'blur(10px)' } : null}>
                  No shows are available for this time slot, please choose
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
