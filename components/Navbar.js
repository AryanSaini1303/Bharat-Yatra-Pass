import Link from "next/link";
import styles from "./Navbar.module.css";
export default function Navbar({ pathName }) {
  return (
    <nav className={styles.navbar}>
      <ul>
        <li>
          <Link
            href={"/admin"}
            style={
              pathName.endsWith("/admin")
                ? {
                    color: "white",
                    backgroundColor: "#8280ff",
                    pointerEvents: "none",
                    fontWeight: "bold",
                  }
                : null
            }
          >
            {pathName.endsWith("/admin") && (
              <div className={styles.marker}></div>
            )}
            {!pathName.endsWith("/admin") ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 14 14"
                width="1.2em"
                height="1.2em"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="5" height="7" x="8.5" y="6.5" rx=".5"></rect>
                  <rect width="5" height="3.01" x="8.5" y=".5" rx=".5"></rect>
                  <rect width="5" height="7" x=".5" y=".5" rx=".5"></rect>
                  <rect width="5" height="3.01" x=".5" y="10.49" rx=".5"></rect>
                </g>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 14 14"
                width="1.2em"
                height="1.2em"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M1 0a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1zm7 1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2.01a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1zm0 6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1zm-8 3.99a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
            )}
            <h5 style={{ fontWeight: "inherit" }}>Dashboard</h5>
          </Link>
        </li>
        <li>
          <Link
            href={"/admin/user"}
            style={
              pathName.endsWith("/user")
                ? {
                    color: "white",
                    backgroundColor: "#8280ff",
                    pointerEvents: "none",
                    fontWeight: "bold",
                  }
                : null
            }
          >
            {pathName.endsWith("/user") && (
              <div className={styles.marker}></div>
            )}
            {!pathName.endsWith("/user") ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1.2em"
                height="1.2em"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M17.928 19.634h2.138a1.165 1.165 0 0 0 1.116-1.555a6.85 6.85 0 0 0-6.117-3.95m0-2.759a3.664 3.664 0 0 0 3.665-3.664a3.664 3.664 0 0 0-3.665-3.674m-1.04 16.795a1.908 1.908 0 0 0 1.537-3.035a8.03 8.03 0 0 0-6.222-3.196a8.03 8.03 0 0 0-6.222 3.197a1.909 1.909 0 0 0 1.536 3.034zM9.34 11.485a4.16 4.16 0 0 0 4.15-4.161a4.151 4.151 0 0 0-8.302 0a4.16 4.16 0 0 0 4.151 4.16"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1.2em"
                height="1.2em"
              >
                <path
                  fill="currentColor"
                  d="M21.987 18.73a2 2 0 0 1-.34.85a1.9 1.9 0 0 1-1.56.8h-1.651a.74.74 0 0 1-.6-.31a.76.76 0 0 1-.11-.67c.37-1.18.29-2.51-3.061-4.64a.77.77 0 0 1-.32-.85a.76.76 0 0 1 .72-.54a7.61 7.61 0 0 1 6.792 4.39a2 2 0 0 1 .13.97M19.486 7.7a4.43 4.43 0 0 1-4.421 4.42a.76.76 0 0 1-.65-1.13a6.16 6.16 0 0 0 0-6.53a.75.75 0 0 1 .61-1.18a4.3 4.3 0 0 1 3.13 1.34a4.46 4.46 0 0 1 1.291 3.12z"
                ></path>
                <path
                  fill="currentColor"
                  d="M16.675 18.7a2.65 2.65 0 0 1-1.26 2.48c-.418.257-.9.392-1.39.39H4.652a2.63 2.63 0 0 1-1.39-.39A2.62 2.62 0 0 1 2.01 18.7a2.6 2.6 0 0 1 .5-1.35a8.8 8.8 0 0 1 6.812-3.51a8.78 8.78 0 0 1 6.842 3.5a2.7 2.7 0 0 1 .51 1.36M14.245 7.32a4.92 4.92 0 0 1-4.902 4.91a4.903 4.903 0 0 1-4.797-5.858a4.9 4.9 0 0 1 6.678-3.57a4.9 4.9 0 0 1 3.03 4.518z"
                ></path>
              </svg>
            )}
            <h5 style={{ fontWeight: "inherit" }}>User management</h5>
          </Link>
        </li>
        <li>
          <Link
            href={"/admin/monument"}
            style={
              pathName.endsWith("/monument")
                ? {
                    color: "white",
                    backgroundColor: "#8280ff",
                    pointerEvents: "none",
                    fontWeight: "bold",
                  }
                : pathName.endsWith("/monument/add")
                ? {
                    color: "white",
                    backgroundColor: "#8280ff",
                    fontWeight: "bold",
                  }
                : null
            }
          >
            {(pathName.endsWith("/monument") ||
              pathName.endsWith("/monument/add")) && (
              <div className={styles.marker}></div>
            )}
            {!(
              pathName.endsWith("/monument") ||
              pathName.endsWith("/monument/add")
            ) ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1.2em"
                height="1.2em"
              >
                <path
                  fill="currentColor"
                  d="M9 1v1h6V1h2v2.162l-1 3V15h1v3h2v5H5v-5h2v-3h1V6.162l-1-3V1zm1 6v8h4V7zm4.28-2l.333-1H9.387l.334 1zM9 17v1h6v-1zm8 3H7v1h10z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1.2em"
                height="1.2em"
              >
                <path
                  fill="currentColor"
                  d="M9 1v1h6V1h2v2.162l-1 3V15h1v3h2v5H5v-5h2v-3h1V6.162l-1-3V1zm5.28 4l.333-1H9.387l.334 1zM9 17v1h6v-1zm8 3H7v1h10z"
                ></path>
              </svg>
            )}
            <h5 style={{ fontWeight: "inherit" }}>Monument management</h5>
          </Link>
        </li>
        <li>
          <Link
            href={"/admin/ticket"}
            style={
              pathName.endsWith("/ticket")
                ? {
                    color: "white",
                    backgroundColor: "#8280ff",
                    pointerEvents: "none",
                    fontWeight: "bold",
                  }
                : null
            }
          >
            {pathName.endsWith("/ticket") && (
              <div className={styles.marker}></div>
            )}
            {!pathName.endsWith("/ticket") ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                width="1.2em"
                height="1.2em"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeMiterlimit="10"
                  strokeWidth="32"
                  d="M366.05 146a46.7 46.7 0 0 1-2.42-63.42a3.87 3.87 0 0 0-.22-5.26l-44.13-44.18a3.89 3.89 0 0 0-5.5 0l-70.34 70.34a23.6 23.6 0 0 0-5.71 9.24a23.66 23.66 0 0 1-14.95 15a23.7 23.7 0 0 0-9.25 5.71L33.14 313.78a3.89 3.89 0 0 0 0 5.5l44.13 44.13a3.87 3.87 0 0 0 5.26.22a46.69 46.69 0 0 1 65.84 65.84a3.87 3.87 0 0 0 .22 5.26l44.13 44.13a3.89 3.89 0 0 0 5.5 0l180.4-180.39a23.7 23.7 0 0 0 5.71-9.25a23.66 23.66 0 0 1 14.95-15a23.6 23.6 0 0 0 9.24-5.71l70.34-70.34a3.89 3.89 0 0 0 0-5.5l-44.13-44.13a3.87 3.87 0 0 0-5.26-.22a46.7 46.7 0 0 1-63.42-2.32Z"
                ></path>
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  strokeWidth="32"
                  d="m250.5 140.44l-16.51-16.51m60.53 60.53l-11.01-11m55.03 55.03l-11-11.01m60.53 60.53l-16.51-16.51"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                width="1.2em"
                height="1em"
              >
                <path
                  fill="currentColor"
                  d="m490.18 181.4l-44.13-44.13a20 20 0 0 0-27-1a30.81 30.81 0 0 1-41.68-1.6a30.81 30.81 0 0 1-1.6-41.67a20 20 0 0 0-1-27L330.6 21.82a19.91 19.91 0 0 0-28.13 0l-70.35 70.34a39.9 39.9 0 0 0-9.57 15.5a7.71 7.71 0 0 1-4.83 4.83a39.8 39.8 0 0 0-15.5 9.58l-180.4 180.4a19.91 19.91 0 0 0 0 28.13L66 374.73a20 20 0 0 0 27 1a30.69 30.69 0 0 1 43.28 43.28a20 20 0 0 0 1 27l44.13 44.13a19.91 19.91 0 0 0 28.13 0l180.4-180.4a39.8 39.8 0 0 0 9.58-15.49a7.69 7.69 0 0 1 4.84-4.84a39.84 39.84 0 0 0 15.49-9.57l70.34-70.35a19.91 19.91 0 0 0-.01-28.09m-228.37-29.65a16 16 0 0 1-22.63 0l-11.51-11.51a16 16 0 0 1 22.63-22.62l11.51 11.5a16 16 0 0 1 0 22.63m44 44a16 16 0 0 1-22.62 0l-11-11a16 16 0 1 1 22.63-22.63l11 11a16 16 0 0 1 .01 22.66Zm44 44a16 16 0 0 1-22.63 0l-11-11a16 16 0 0 1 22.63-22.62l11 11a16 16 0 0 1 .05 22.67Zm44.43 44.54a16 16 0 0 1-22.63 0l-11.44-11.5a16 16 0 1 1 22.68-22.57l11.45 11.49a16 16 0 0 1-.01 22.63Z"
                ></path>
              </svg>
            )}
            <h5 style={{ fontWeight: "inherit" }}>Ticket management</h5>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
