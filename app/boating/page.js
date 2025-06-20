'use client';

import Loader from '@/components/loader';
import { supabase } from '@/lib/supabaseClient';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import TicketsChart from '@/components/ChartComponent';

export default function BoatingAdminPage() {
  const authorizedUsers =
    process.env.NEXT_PUBLIC_AUTHORIZED_BOATING_EMAILS?.split(',') || [];
  const [user, setUser] = useState();
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);
  const [boatData, setBoatData] = useState();
  const [ticketsData, setTicketsData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  console.log(pathname);

  const handleBookClick = () => {
    router.push(`/booking/boating/${boatData.id}?mode=vendor`);
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/boating-login');
    } catch (err) {
      console.error('Error signing out:', err.message);
    }
  };

  useEffect(() => {
    if (!user || !authorizedUsers.includes(user.email)) return;
    const fetchVendorDetails = async () => {
      try {
        const res = await fetch(`/api/fetchVendorDetails?email=${user.email}`);
        const data = await res.json();
        // console.log(data);
        setBoatData(data[0]);
        fetchVendorTickets(data[0]);
        setLoading(false);
        // console.log(data[0]);
      } catch (error) {
        setLoading(false);
        console.log(error.message);
      }
    };
    const fetchVendorTickets = async (boat) => {
      try {
        const res = await fetch(`api/fetchVendorTickets?id=${boat.id}`);
        const data = await res.json();
        setTicketsData(data);
      } catch (error) {}
    };
    fetchVendorDetails();
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoadingUser(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!ticketsData || ticketsData.length === 0) return;
    const total = ticketsData.reduce((acc, ticket) => {
      const ticketTotal = ticket.ticketNum.reduce((innerAcc, item) => {
        if (item.booked > 0) {
          return innerAcc + item.booked * item.publicSeatPrice;
        } else if (item.isBookedPrivate) {
          return innerAcc + item.privateBoatPrice;
        }
        return innerAcc;
      }, 0);
      return acc + ticketTotal;
    }, 0);
    setTotalSales(total);
  }, [ticketsData]);

  if (loadingUser) {
    return <Loader margin={'15rem auto'} />;
  } else if (!user || !authorizedUsers.includes(user.email)) {
    return <p>Unauthorized</p>;
  }

  return (
    <div className={styles.container}>
      <section className={styles.sidebar}>
        <ul>
          <li>
            <button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1.9rem"
                height="1.9rem"
                style={
                  pathname === '/boating'
                    ? { filter: 'brightness(200%)' }
                    : null
                }
              >
                <path
                  fill="white"
                  d="M20 20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9H1l10.327-9.388a1 1 0 0 1 1.346 0L23 11h-3zM9 10v6h6v-6zm2 2h2v2h-2z"
                ></path>
              </svg>
              <h4
                style={
                  pathname === '/boating'
                    ? { filter: 'brightness(200%)' }
                    : null
                }
              >
                Home
              </h4>
            </button>
          </li>
          <li>
            <button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1.9rem"
                height="1.9rem"
                style={
                  pathname === '/boating/boats'
                    ? { filter: 'brightness(200%)' }
                    : null
                }
              >
                <path
                  fill="white"
                  d="M3 18h18a.5.5 0 0 1 .4.8l-2.1 2.8a1 1 0 0 1-.8.4h-13a1 1 0 0 1-.8-.4l-2.1-2.8A.5.5 0 0 1 3 18M15 2.425V15a1 1 0 0 1-1 1H4.04a.5.5 0 0 1-.39-.812L14.11 2.113a.5.5 0 0 1 .89.312"
                ></path>
              </svg>
              <h4
                style={
                  pathname === '/boating/boats'
                    ? { filter: 'brightness(200%)' }
                    : null
                }
              >
                Boats
              </h4>
            </button>
          </li>
          <li>
            <button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1.9rem"
                height="1.9rem"
                style={
                  pathname === '/boating/edit'
                    ? { filter: 'brightness(200%)' }
                    : null
                }
              >
                <path
                  fill="none"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 17h12M4 17l3.5-3.5M4 17l3.5 3.5M7 7h13m0 0l-3.5-3.5M20 7l-3.5 3.5"
                ></path>
              </svg>
              <h4
                style={
                  pathname === '/boating/edit'
                    ? { filter: 'brightness(200%)' }
                    : null
                }
              >
                Edit
              </h4>
            </button>
          </li>
        </ul>
      </section>
      <section className={styles.content}>
        <h1 className={styles.heading}>Vendor Dashboard (Boating)</h1>
        <div className={styles.statsGrid}>
          <div className={styles.card}>
            <h2>Total Tickets Booked</h2>
            <p>{ticketsData.length}</p>
          </div>
          <div className={styles.card}>
            <h2>Total Sales</h2>
            <p>&#8377;{totalSales}</p>
          </div>
        </div>
        <TicketsChart tickets={ticketsData} />
      </section>
    </div>
  );
}
