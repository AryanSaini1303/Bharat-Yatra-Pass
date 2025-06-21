'use client';

import VendorDashboardSidebar from '@/components/vendorDashboardSidebar';
import { usePathname, useRouter } from 'next/navigation';
import styles from './page.module.css';
import Loader from '@/components/loader';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function Boats() {
  const pathname = usePathname();
  const authorizedUsers =
    process.env.NEXT_PUBLIC_AUTHORIZED_BOATING_EMAILS?.split(',') || [];
  const [user, setUser] = useState();
  const [loadingUser, setLoadingUser] = useState(true);
  const [boatData, setBoatData] = useState();
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
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error.message);
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
        {boatData && (
          <div className={styles.boatDetails}>
            <h1>Boat Prices</h1>
            <section className={styles.pricesSection}>
              {boatData.boats?.map((boat, idx) => (
                <div className={styles.boatCard} key={idx}>
                  <h2>{boat.name}</h2>
                  <label>
                    Public Seat Price:
                    <input
                      type="number"
                      value={boat.publicSeatPrice}
                      onChange={(e) => {
                        const updatedBoats = [...boatData.boats];
                        updatedBoats[idx].publicSeatPrice = e.target.value
                          ? parseInt(e.target.value)
                          : '';
                        setBoatData({ ...boatData, boats: updatedBoats });
                      }}
                      min={0}
                    />
                  </label>
                  <label>
                    Private Boat Price:
                    <input
                      type="number"
                      value={boat.privateBoatPrice}
                      onChange={(e) => {
                        const updatedBoats = [...boatData.boats];
                        updatedBoats[idx].privateBoatPrice = e.target.value
                          ? parseInt(e.target.value)
                          : '';
                        setBoatData({ ...boatData, boats: updatedBoats });
                      }}
                      min={0}
                    />
                  </label>
                </div>
              ))}
            </section>
            <button
              className={styles.saveButton}
              onClick={async () => {
                try {
                  const { error } = await supabase
                    .from('boating')
                    .update({ boats: boatData.boats })
                    .eq('id', boatData.id);
                  if (!error) alert('Prices updated successfully!');
                  else alert('Failed to update prices.');
                } catch (error) {
                  alert('Something went wrong.');
                }
              }}
            >
              Save Prices
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
