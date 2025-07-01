'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './TicketPage.module.css';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import Loader from './loader';
import html2canvas from 'html2canvas';

export default function Ticket() {
  const searchParams = useSearchParams();
  const ticketId = decodeURIComponent(searchParams.get('q'));
  const [type, setType] = useState('');
  const [ticketDetails, setTicketDetails] = useState({});
  const [user, setUser] = useState();
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [ticketImage, setTicketImage] = useState('');
  const dateObj = new Date(ticketDetails?.dateTime);
  const router = useRouter();
  const date = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: 'true',
  });

  async function convertImageUrlToBase64(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // base64 string
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

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
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/fetchTicket?tickedId=${ticketId}`);
        const data = await response.json();
        setType(data.service_provider);
        setTicketDetails(data);
        const image = await convertImageUrlToBase64(data.monumentImage);
        // console.log(image);
        setTicketImage(image);
        // console.log(data);
        setLoadingDetails(false);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setLoadingDetails(false);
      }
    };
    fetchTicket();
  }, []);

  useEffect(() => {
    if (ticketDetails.ticket_sent) return;
    (async () => {
      const element = document.getElementById('ticketSection');
      if (!element) return;
      // const image = document.getElementById('ticketImage');
      // await waitForImageToLoad(image);
      const canvas = await html2canvas(element);
      try {
        const blob = await new Promise((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/png');
        });
        if (!blob) return;
        const formData = new FormData();
        formData.append('file', blob, 'ticket.png');
        formData.append('phone', ticketDetails.user_phone);
        formData.append('user_id', ticketDetails.user_id);
        // const response = await fetch('/api/shareTicket', {
        //   method: 'POST',
        //   body: formData,
        // });
        // const data = await response.json();
        // console.log(data);
        // if (response.ok) {
        //   // alert('📤 Ticket sent via WhatsApp!');
        // } else {
        //   // alert('❌ Failed to send ticket via WhatsApp, please try refeshing the page.',);
        // }
      } catch (error) {
        console.log(error.message);
      }
    })();
  }, [ticketDetails, ticketImage]);

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
      style={{ background: 'linear-gradient(to bottom, white, white)' }}
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
        <Loader margin={'10rem auto'} />
      ) : ticketDetails.error ? (
        <p style={{ textAlign: 'center', marginTop: '10rem' }}>
          No ticket found!
        </p>
      ) : (
        <div className={styles.ticketSectionContainer}>
          <section className={styles.ticketSection} id="ticketSection">
            <div className={styles.borderCircle}></div>
            <div className={styles.borderCircle}></div>
            <div className={styles.borderCircle}></div>
            <div className={styles.borderCircle}></div>
            <img
              src={ticketImage}
              alt="Ticket image"
              id="ticketImage"
              // crossOrigin="anonymous"
            />
            <h2>{ticketDetails.monumentName}</h2>
            <h3>{ticketDetails.monumentCity}</h3>
            <section className={styles.dateTime}>
              <h4>{date}</h4>
              <h4>{time}</h4>
            </section>
            {ticketDetails.ticketNum &&
              type.length !== 0 &&
              (type === 'monument' ? (
                <ul>
                  {ticketDetails.ticketNum.adult != 0 && (
                    <li>
                      Adult <span>x {ticketDetails.ticketNum.adult}</span>
                    </li>
                  )}
                  {ticketDetails.ticketNum.foreigner != 0 && (
                    <li>
                      Non &mdash; Indian{' '}
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
              ) : type === 'boating' ? (
                <ul>
                  {ticketDetails.ticketNum.map((item, index) => {
                    if (item.booked > 0) {
                      return (
                        <li key={index}>
                          {item.name} ( public seats ){' '}
                          <span>x {item.booked}</span>
                        </li>
                      );
                    } else if (item.isBookedPrivate) {
                      return (
                        <li key={index}>
                          {item.name} ( private ) <span>x 1</span>
                        </li>
                      );
                    }
                  })}
                </ul>
              ) : type === 'theatre' ? (
                <ul>
                  <li>
                    Seats <span>x {ticketDetails.ticketNum.booked}</span>
                  </li>
                </ul>
              ) : (
                'loading...'
              ))}
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
                  {ticketDetails.status == 'active' ? 'Active' : 'Expired'}
                </h5>
                <div
                  className={styles.statusCircle}
                  style={
                    ticketDetails.status == 'active'
                      ? { backgroundColor: 'green' }
                      : { backgroundColor: 'red' }
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
