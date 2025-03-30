"use client";

import Loader from "@/components/loader";
import { supabase } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../page.module.css";
import Navbar from "@/components/Navbar";

export default function AdminUserPage() {
  const authorizedUsers =
    process.env.NEXT_PUBLIC_AUTHORIZED_EMAILS?.split(",") || []; // change this in page.js in home folder too if adding or removing authorized users, the one on the home page controls the redirection to this page and this one controls the access to this page
  const [user, setUser] = useState();
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);
  const pathName = usePathname();
  const [monuments, setMonuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearcyQuery] = useState("");
  const [tmtMonument, setTmtMonument] = useState(null);
  const [terminated, setTerminated] = useState(false);
  const [terminating, setTerminating] = useState(false);
  // console.log(pathName);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/"); // Redirect after successful sign-out
    } catch (err) {
      console.error("Error signing out:", err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // console.log(e.target.value);
    // if (e.target.value.length == 0) {
    //   setSearcyQuery(null);
    // } else {
    // }
    setSearcyQuery(e.target.value);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      //   console.log(user);
      setUser(user);
      setLoadingUser(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    // console.log("here");
    setLoading(true);
    const fetchMonumentsByQuery = async () => {
      try {
        let response;
        if (searchQuery?.length != 0) {
          response = await fetch(
            `/api/fetchMonumentsByQuery?query=${searchQuery}`
          );
        } else {
          response = await fetch("/api/fetchAllMonuments");
        }
        const data = await response.json();
        setMonuments(data);
        // console.log(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching monuments:", error);
        setLoading(false);
      }
    };
    const delayDebounceFn = setTimeout(() => {
      fetchMonumentsByQuery();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, terminated]);

  useEffect(() => {
    const fetchAllMonuments = async () => {
      try {
        const response = await fetch("/api/fetchAllMonuments");
        const data = await response.json();
        setMonuments(data);
        // console.log(data);
        setLoading(false);
      } catch (error) {
        console.error("Unexpected Error:", error.message);
        setLoading(false);
      }
    };
    fetchAllMonuments();
  }, []);
  // console.log(monuments);

  useEffect(() => {
    const terminateMonument = async () => {
      if (tmtMonument) {
        setTerminating(true);
        setTerminated(false);
        try {
          const response = await fetch(
            `/api/terminateMonument?id=${tmtMonument}`,
            {
              method: "DELETE",
            }
          );
          const data = await response.json();
          if (data.message) {
            setTmtMonument(null);
            setTerminated(true);
            setTerminating(false);
          } else {
            console.error("Error terminating monument:", data.error);
          }
        } catch (error) {
          console.error("Unexpected Error:", error.message);
          setTmtMonument(null);
          setTerminating(false);
          setTerminated(true);
        }
      }
    };
    terminateMonument();
  }, [tmtMonument]);

  if (loadingUser) {
    return <Loader margin={"15rem auto"} />;
  } else if (!user || !authorizedUsers.includes(user.email)) {
    return <p>Unauthorized</p>;
  }

  return (
    <div className="wrapper">
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <button onClick={signOut}>Sign Out</button>
      </header>
      <section className={styles.container}>
        <Navbar pathName={pathName} />
        <section className={styles.content}>
          <div className={styles.inputContainer}>
            <form
              className={styles.searchBar}
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
                type="text"
                name="monument"
                id=""
                placeholder="Search monument..."
                onChange={handleSearch}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1.5em"
                height="1.5em"
              >
                <g fill="grey" fillRule="evenodd" clipRule="evenodd">
                  <path d="M10.5 5.5a5 5 0 1 0 0 10a5 5 0 0 0 0-10m-6.5 5a6.5 6.5 0 1 1 13 0a6.5 6.5 0 0 1-13 0"></path>
                  <path d="M14.47 14.47a.75.75 0 0 1 1.06 0l4 4a.75.75 0 1 1-1.06 1.06l-4-4a.75.75 0 0 1 0-1.06"></path>
                </g>
              </svg>
            </form>
            <button
              onClick={() => {
                router.push("/admin/monument/add");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                width="1.5em"
                height="1.5em"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 25V7m-9 9h18"
                ></path>
              </svg>
              <h1>Add Monument</h1>
            </button>
          </div>
          {loading ? (
            <Loader margin={"15rem auto"} />
          ) : monuments?.length != 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Monument</th>
                  <th>Price</th>
                  <th>Timings</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {monuments.map((monument, index) => (
                  <tr key={monument.id}>
                    <td>{index + 1}</td>
                    <td>
                      {monument.name}, {monument.city}
                    </td>
                    <td>
                      Adult: &#8377;{monument.ticket_price.adult}, Child:
                      &#8377;{monument.ticket_price.child}, Senior: &#8377;
                      {monument.ticket_price.senior}, Foreigner: &#8377;
                      {monument.ticket_price.foreigner}
                    </td>
                    <td>
                      {(() => {
                        // here we split the hour and minute from the opening_time string and then give it to the date object i.e. date through a function setHours() to set time
                        const [hours, minutes] =
                          monument.opening_time.split(":");
                        const date = new Date();
                        date.setHours(hours, minutes);
                        return date.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        });
                      })()}{" "}
                      &ndash;{" "}
                      {(() => {
                        const [hours, minutes] =
                          monument.closing_time.split(":");
                        const date = new Date();
                        date.setHours(hours, minutes);
                        return date.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        });
                      })()}
                    </td>
                    <td>
                      <button
                        className={styles.terminateButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTmtMonument(monument.id);
                          setTerminating(true);
                        }}
                        style={
                          terminating && tmtMonument === monument.id
                            ? { backgroundColor: "grey", pointerEvents: "none" }
                            : null
                        }
                      >
                        Terminate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No Monuments Found!</p>
          )}
        </section>
      </section>
    </div>
  );
}
