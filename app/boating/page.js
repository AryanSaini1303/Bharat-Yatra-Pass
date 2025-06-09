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
  const [loading, setLoading] = useState(true);

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
        setBoatData(data[0]);
        fetchVendorTickets(data[0]);
        setLoading(false);
        console.log(data[0]);
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

  return (
    <div className={styles.container}>
      <button className={styles.signOutButton} onClick={signOut}>
        Sign Out
      </button>
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
      {boatData && ticketsData.length !== 0 ? (
        <div className={styles.boatSection}>
          <h2 className={styles.sectionTitle}>Boat Status</h2>
          {boatData && boatData.boats.some((boat) => boat.booked > 0) ? (
            <div className={styles.boatSubSection}>
              <h3 className={styles.subHeading}>
                Public Booking Boats{' '}
                <span>(&#8377;{boatData.boats[0].publicSeatPrice}/seat)</span>
              </h3>
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
                  {boatData &&
                    boatData.boats.map((boat) => {
                      if (boat.booked > 0) {
                        return (
                          <tr key={boat.name}>
                            <td>{boat.name}</td>
                            <td>{boat.capacity}</td>
                            <td>{boat.booked}</td>
                            <td>{boat.capacity - boat.booked}</td>
                          </tr>
                        );
                      }
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Currently no Boats have public seats booked...</p>
          )}
          {boatData && boatData.boats.some((boat) => boat.isBookedPrivate) ? (
            <div className={styles.boatSubSection}>
              <h3 className={styles.subHeading}>Privately Booked Boats</h3>
              <table className={styles.boatTable}>
                <thead>
                  <tr>
                    <th>Boat Name</th>
                    <th>Total Seats</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {boatData &&
                    boatData.boats.map((boat) => {
                      if (boat.isBookedPrivate) {
                        return (
                          <tr key={boat.name}>
                            <td>{boat.name}</td>
                            <td>{boat.capacity}</td>
                            <td>&#8377;{boat.privateBoatPrice}</td>
                            <td>
                              {boat.isBookedPrivate ? 'Booked' : 'Vacant'}
                            </td>
                          </tr>
                        );
                      }
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Currently no Boats are privately booked...</p>
          )}
        </div>
      ) : loading ? (
        <Loader margin={'15rem auto'} />
      ) : (
        <p>No Booking found...</p>
      )}
      <button className={styles.bookButton} onClick={handleBookClick}>
        Book Tickets
      </button>
    </div>
  );
}
