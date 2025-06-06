'use client';
import { supabase } from '@/lib/supabaseClient';
import { use, useEffect, useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import Loader from '@/components/loader';

export default function VerifiedTickets() {
  const [user, setUser] = useState();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();
  const [type, setType] = useState('monument');
  // console.log(tickets[0].dateTime);

  // const date = dateObj.toLocaleDateString("en-US", {
  //   year: "numeric",
  //   month: "long",
  //   day: "numeric",
  // });
  // const time = dateObj.toLocaleTimeString("en-US", {
  //   hour: "numeric",
  //   minute: "2-digit",
  //   hour12: "true",
  // });

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
          const { user } = session;
          setUser(user);
          setLoadingUser(false);
          // console.log(user);
        } else {
          setUser(null);
          setLoadingUser(false);
        }
      },
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(
          `/api/fetchTickets?verified=${true}&id=${user.id}`,
        );
        const data = await response.json();
        setType(Array.isArray(data.ticketNum) ? 'boating' : 'monuments');
        setTickets(data);
        // console.log(data);
        setLoading(false);
      } catch (error) {
        console.log(error.message);
        setLoading(false);
      }
    };
    user?.id && fetchTickets();
  }, [user]);

  if (loadingUser) {
    return <Loader margin={'15rem auto'} />;
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
        <h2>Verified tickets</h2>
      </header>
      <div className={styles.ticketList}>
        {loading ? (
          <Loader margin={'10rem auto'} />
        ) : tickets.length > 0 ? (
          tickets.map((ticket) => (
            <a
              key={ticket.ticketId}
              href={`/ticket?q=${encodeURIComponent(
                ticket.ticketId,
              )}&type=${encodeURIComponent(type)}`}
              className={styles.ticketCard}
            >
              <img
                src={ticket.monumentImage}
                alt={ticket.monumentName}
                className={styles.ticketImage}
              />
              <div className={styles.ticketDetails}>
                <h3 className={styles.monumentName}>{ticket.monumentName}</h3>
                <p className={styles.ticketId}>
                  {new Date(ticket?.dateTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className={styles.ticketId}>
                  {new Date(ticket?.dateTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: 'true',
                  })}
                </p>
              </div>
            </a>
          ))
        ) : (
          <p className={styles.noTickets}>No tickets available.</p>
        )}
      </div>
    </div>
  );
}
