import styles from './vendorDashboardSidebar.module.css';

export default function VendorDashboardSidebar({ pathname, router }) {
  return (
    <section className={styles.sidebar}>
      <ul>
        <li>
          <button onClick={() => router.push('/boating')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="1.9rem"
              height="1.9rem"
              style={
                pathname === '/boating' ? { filter: 'brightness(200%)' } : null
              }
            >
              <path
                fill="white"
                d="M20 20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9H1l10.327-9.388a1 1 0 0 1 1.346 0L23 11h-3zM9 10v6h6v-6zm2 2h2v2h-2z"
              ></path>
            </svg>
            <h4
              style={
                pathname === '/boating' ? { filter: 'brightness(200%)' } : null
              }
            >
              Home
            </h4>
          </button>
        </li>
        <li>
          <button onClick={() => router.push('/boating/boats')}>
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
          <button onClick={() => router.push('/boating/edit')}>
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
  );
}
