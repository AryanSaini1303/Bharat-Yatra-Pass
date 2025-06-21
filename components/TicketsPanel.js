'use client';
import { useEffect, useState } from 'react';
import styles from './TicketsPanel.module.css';
import Loader from './loader';

export default function TicketsPanel({ tickets }) {
  const active = tickets.filter((t) => t.status === 'active');
  const [hasOnline, setHasOnline] = useState(false);
  const [hasOffline, setHasOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  const getBoats = (origin, type) => {
    return active
      .filter((t) => t.origin === origin)
      .flatMap((ticket) =>
        ticket.ticketNum
          .filter((boat) => {
            if (type === 'public')
              return boat.booked > 0 && !boat.isBookedPrivate;
            if (type === 'private') return boat.isBookedPrivate;
            return false;
          })
          .map((boat) => ({
            ...boat,
            dateTime: ticket.dateTime,
          })),
      );
  };

  const renderTable = (origin, type) => {
    const boats = getBoats(origin, type);
    if (boats.length === 0) return null;
    return (
      <div className={styles.tableSection}>
        <h2 className={styles.heading}>
          {type === 'public' ? 'Public Seats' : 'Private Boats'}
        </h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>S.no.</th>
              <th>Boat Name</th>
              <th>{type === 'public' ? 'Booked Seats' : 'Private Status'}</th>
              <th>Time Slot</th>
            </tr>
          </thead>
          <tbody>
            {boats.map((b, i) => (
              <tr key={i}>
                <td>{i+1}.</td>
                <td>{b.name}</td>
                <td>
                  {type === 'public'
                    ? b.booked
                    : b.isBookedPrivate
                    ? 'Booked'
                    : 'Available'}
                </td>
                <td>
                  {new Date(b.dateTime).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  useEffect(() => {
    const onlineBoats = active.some((t) => t.origin === 'userPanel');
    const offlineBoats = active.some((t) => t.origin === 'vendorPanel');
    setHasOnline(onlineBoats);
    setHasOffline(offlineBoats);
    setLoading(false);
  }, [active]);

  return loading ? (
    <Loader margin={'15rem auto'} />
  ) : (
    <div className={styles.wrapper}>
      <h1 style={{fontSize:'3rem'}}>Boats Status</h1>
      {hasOnline && <h2 className={styles.header}>Online Tickets</h2>}
      <div className={styles.group}>
        {renderTable('userPanel', 'public')}
        {renderTable('userPanel', 'private')}
      </div>
      {hasOffline && <h2 className={styles.header}>Offline Tickets</h2>}
      <div className={styles.group}>
        {renderTable('vendorPanel', 'public')}
        {renderTable('vendorPanel', 'private')}
      </div>
      {!hasOffline && !hasOnline && (
        <h2 className={styles.noTickets}>No tickets available!</h2>
      )}
    </div>
  );
}
