'use client';

import Loader from '@/components/loader';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function BoatingAdminPage() {
  const authorizedUsers =
    process.env.NEXT_PUBLIC_AUTHORIZED_BOATING_EMAILS?.split(',') || [];
  const [user, setUser] = useState();
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);
  const [boatData, setBoatData] = useState();
  const [ticketsData, setTicketsData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/adminLogin');
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
        setBoatData(data[0]);
        fetchVendorTickets(data[0]);
        // console.log(data);
      } catch (error) {
        console.log(error.message);
      }
    };
    const fetchVendorTickets = async (boat) => {
      try {
        const res = await fetch(`api/fetchVendorTickets?id=${boat.id}`);
        const data = await res.json();
        setTicketsData(data);
        console.log(data);
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

  return boatData && ticketsData.length !== 0 ? (
    <div className={styles.container}>
      <h1 className={styles.heading}>Vendor Dashboard</h1>

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

      <div className={styles.boatSection}>
        <h2 className={styles.sectionTitle}>Boat Status</h2>

        <div className={styles.boatSubSection}>
          <h3 className={styles.subHeading}>Public Booking Boats</h3>
          <table className={styles.boatTable}>
            <thead>
              <tr>
                <th>Boat Name</th>
                <th>Total Seats</th>
                <th>Booked Seats</th>
                <th>Available Seats</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sea Explorer</td>
                <td>100</td>
                <td>75</td>
                <td>25</td>
              </tr>
              <tr>
                <td>Wave Rider</td>
                <td>60</td>
                <td>20</td>
                <td>40</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={styles.boatSubSection}>
          <h3 className={styles.subHeading}>Private Booked Boats</h3>
          <table className={styles.boatTable}>
            <thead>
              <tr>
                <th>Boat Name</th>
                <th>Total Seats</th>
                <th>Booked Seats</th>
                <th>Available Seats</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ocean Queen</td>
                <td>80</td>
                <td>80</td>
                <td>0</td>
                <td>Booked</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
    <Loader margin={'15rem auto'} />
  );
}
