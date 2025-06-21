'use client';

import Loader from '@/components/loader';
import { supabase } from '@/lib/supabaseClient';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import TicketsChart from '@/components/ChartComponent';
import VendorDashboardSidebar from '@/components/vendorDashboardSidebar';

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
  const [analyticFormat, setAnalyticFormat] = useState('daily');

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
      <VendorDashboardSidebar pathname={pathname} router={router} />
      {loading ? (
        <Loader margin={'15rem auto'} />
      ) : boatData.length !== 0 && ticketsData !== 0 ? (
        <section className={styles.content}>
          <header className={styles.header}>
            <h1 className={styles.heading}>
              {boatData?.name}
            </h1>
            <button className={styles.signOutButton} onClick={signOut}>
              Sign out
            </button>
          </header>
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
          <div className={styles.buttonContainer}>
            <button onClick={()=>setAnalyticFormat('daily')} style={analyticFormat==='daily'?{border:"dashed 1.618px black"}:null}>Daily</button>
            <button onClick={()=>setAnalyticFormat('monthly')} style={analyticFormat==='monthly'?{border:"dashed 1.618px black"}:null}>Monthly</button>
          </div>
          <TicketsChart tickets={ticketsData} analyticFormat={analyticFormat}/>
          <button className={styles.book} onClick={handleBookClick}>
            Book Tickets
          </button>
        </section>
      ) : (
        <p>No Data Found...</p>
      )}
    </div>
  );
}
