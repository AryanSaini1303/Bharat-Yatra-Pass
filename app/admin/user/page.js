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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearcyQuery] = useState("");
  const [tmtUser, setTmtUser] = useState(null);
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
    setLoading(true);
    const fetchUserByName = async () => {
      try {
        let response;
        if (searchQuery?.length != 0) {
          response = await fetch(`/api/fetchUserByName?name=${searchQuery}`);
        } else {
          response = await fetch("/api/fetchUsers");
        }
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };
    const delayDebounceFn = setTimeout(() => {
      fetchUserByName();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, terminated]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/fetchUsers");
        const data = await response.json();
        setUsers(data);
        // console.log(data);
        setLoading(false);
      } catch (error) {
        console.error("Unexpected Error:", error.message);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const terminateUser = async () => {
      if (tmtUser) {
        setTerminating(true);
        setTerminated(false);
        try {
          const response = await fetch(`/api/terminateUser?id=${tmtUser}`, {
            method: "DELETE",
          });
          const data = await response.json();
          if (data.message) {
            setTmtUser(null);
            setTerminated(true);
            setTerminating(false);
          } else {
            console.error("Error terminating user:", data.error);
          }
        } catch (error) {
          console.error("Unexpected Error:", error.message);
          setTmtUser(null);
          setTerminated(true);
        }
      }
    };
    terminateUser();
  }, [tmtUser]);

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
          <form
            className={styles.searchBar}
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              type="text"
              name="user"
              id=""
              placeholder="Find a user..."
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
          {loading ? (
            <Loader margin={"15rem auto"} />
          ) : users ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined On</th>
                  {/* <th>Last Sign In</th> */}
                  {/* <th>Action</th> */}
                  <th>User Id</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>
                      <img
                        src={
                          user.user_metadata.picture ||
                          "/images/user_profile.png"
                        }
                        alt="Profile image"
                        onError={(e) => {
                          e.target.src = "/images/user_profile.png";
                        }}
                      />
                    </td>
                    <td>{user.user_metadata.full_name}</td>
                    <td>{user.email}</td>
                    <td>
                      {new Date(user.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true, // Enables 12-hour format with AM/PM
                      })}
                    </td>
                    {/* <td>
                      {new Date(user.last_sign_in_at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true, // Enables 12-hour format with AM/PM
                      })}
                    </td> */}
                    {/* <td>
                      <button
                        className={styles.terminateButton}
                        onClick={() => {
                          setTmtUser(user.id);
                          setTerminating(true);
                        }}
                        style={
                          terminating && tmtUser === user.id
                            ? { backgroundColor: "grey", pointerEvents: "none" }
                            : null
                        }
                      >
                        Terminate
                      </button>
                    </td> */}
                    <td>{user.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No Users Found!</p>
          )}
        </section>
      </section>
    </div>
  );
}
