'use client';

import VendorDashboardSidebar from '@/components/vendorDashboardSidebar';
import { usePathname, useRouter } from 'next/navigation';
import styles from './page.module.css';
import Loader from '@/components/loader';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import TicketsPanel from '@/components/TicketsPanel';

export default function Boats() {
  const pathname = usePathname();
  const authorizedUsers =
    process.env.NEXT_PUBLIC_AUTHORIZED_BOATING_EMAILS?.split(',') || [];

  const [user, setUser] = useState();
  const [loadingUser, setLoadingUser] = useState(true);
  const [boatData, setBoatData] = useState();
  const [ticketsData, setTicketsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

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
    if (!user || !authorizedUsers.includes(user.email)) return;

    const fetchVendorDetails = async () => {
      try {
        const res = await fetch(`/api/fetchVendorDetails?email=${user.email}`);
        const data = await res.json();
        setBoatData(data[0]);
        fetchVendorTickets(data[0]);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error.message);
      }
    };

    const fetchVendorTickets = async (boat) => {
      try {
        const res = await fetch(`/api/fetchVendorTickets?id=${boat.id}`);
        const data = await res.json();
        setTicketsData(data);
      } catch (error) {
        console.log('Error fetching vendor tickets:', error.message);
      }
    };

    fetchVendorDetails();
  }, [user]);

  if (loadingUser) {
    return <Loader margin={'15rem auto'} />;
  } else if (!user || !authorizedUsers.includes(user.email)) {
    return <p>Unauthorized</p>;
  }

  return (
    <div className={styles.container}>
      <VendorDashboardSidebar pathname={pathname} router={router} />
      <div className={styles.content}>
        <TicketsPanel tickets={ticketsData} />
      </div>
    </div>
  );
}
