"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
// import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";
import axios from "axios";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [profileClick, setProfileClick] = useState(false);
  const [locationClick, setLocationClick] = useState(false);
  const [location, setLocation] = useState(() => {
    if (typeof window !== "undefined") {
      const savedCity = localStorage.getItem("userCity");
      return savedCity || "Udaipur";
    }
    return "Udaipur"; // Default value for SSR
  });
  const authorizedUsers =
    process.env.NEXT_PUBLIC_AUTHORIZED_EMAILS?.split(",") || [];
  // console.log("here", authorizedUsers);

  const dropdownRef = useRef(null); // React hook which is used to point to a div something like "document.getElementById"
  const locationRef = useRef(null);
  const [monuments, setMonuments] = useState([]);
  const [loadingMonuments, setLoadingMonuments] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState();
  const [loadingUser, setLoadingUser] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [sub, setSub] = useState("");
  const [name, setName] = useState("");
  const [urlToken, setUrlToken] = useState("");
  // const [token, setToken] = useState(null);
  const cities = [
    "Jaipur",
    "Jodhpur",
    "Kota",
    "Bikaner",
    "Bhiwadi",
    "Udaipur",
    "Ajmer",
    "Bhilwara",
    "Alwar",
    "Sikar",
    "Bharatpur",
    "Pali",
    "Sri",
    "Ganganagar",
    "Beawar",
    "Baran",
  ];
  const router = useRouter();

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("https://udaipurinsider.com"); // Redirect after successful sign-out
    } catch (err) {
      console.error("Error signing out:", err.message);
    }
  };

  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  /**************************************************************************************************************** */

  async function setUserSession(token) {
    let jwtToken;
    if (!token) {
      const res = await fetch("/api/generateToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, sub }),
      });
      const data = await res.json();
      jwtToken = data.token;
    }
    const { data, error } = await supabase.auth.setSession({
      access_token: token || jwtToken,
      refresh_token: token || jwtToken,
    });
    if (error) {
      console.error("Session error:", error.message);
    } else {
      // console.log("Supabase session established ✅", data);
    }
  }

  useEffect(() => {
    const fetchToken = async (email) => {
      const res = await fetch("/api/createOrLoginUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sub, name }),
      });
      const { token } = await res.json(); // <-- This token is what Supabase accepts
      setUrlToken(token);
      // console.log(token);
      setUserSession(token);
    };
    userEmail?.length != 0 && fetchToken(userEmail);
  }, [userEmail]);
  /**************************************************************************************************************** */
  const isValidSSOAccessToken = async (token) => {
    const serverUrl = "https://keycloak.mogiio.com"; // ✅ Fixed URL
    const realmName = "udaipurinsider";
    const url = `${serverUrl}/realms/${realmName}/protocol/openid-connect/userinfo`;
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response.data);
      setName(response.data.name);
      setSub(response.data.sub);
      setUserEmail(response.data.email);
      setLoadingUser(false);
      if (response.status === 200) {
        // console.log("✅ Token successfully validated");
        return { status: true, data: response.data };
      } else {
        return { status: false, message: "❌ Unexpected status code" };
      }
    } catch (error) {
      console.log(
        "⚠️ Error during token validation:",
        error?.response?.data || error.message
      );
      setLoadingUser(false);
      return { status: false, message: "❌ Token validation failed" };
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("token");
    console.log(accessToken);
    console.log(window.location.href);
    if (accessToken) {
      // setToken(accessToken);
      // console.log(accessToken);
      isValidSSOAccessToken(accessToken)
        .then((response) => {
          if (response.status) {
            // console.log("Token is valid");
            // Perform any action you need with the valid token
          } else {
            console.error("Invalid token");
            // Handle invalid token case
          }
        })
        .catch((error) => {
          console.error("Error validating token:", error);
        });
    } else {
      console.warn("No token found in URL");
    }
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
          const { user } = session;
          setUser(user);
          setLoadingUser(false);
          // console.log(user);
        } else {
          setLoadingUser(false);
          setUser(null);
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // On page load, fetch the city from localStorage
  useEffect(() => {
    const savedCity = localStorage.getItem("userCity");
    if (savedCity) {
      // console.log("📍 City found in localStorage:", savedCity);
      setLocation(savedCity);
    } else {
      setLocation("Udaipur");
    }
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    const monument = e.target.value;
    setSearchQuery(monument);
    // console.log("Searching for: ", monument);
  }

  useEffect(() => {
    if (profileClick && dropdownRef.current) {
      dropdownRef.current.focus();
    }
  }, [profileClick]); // Here what we are doing is we just check on every profileClick that if it's true then we autofocus that particular div to make the onBlur work properly later on as without this the dropdown gets visible but it isn't focused so we have to click on it to get focused then click anywhere else to trigger onBlur, that's why this autofocus is needed.

  useEffect(() => {
    if (locationClick && locationRef.current) {
      locationRef.current.focus();
    }
  }, [locationClick]);

  useEffect(() => {
    const fetchMonuments = async () => {
      try {
        const response = await fetch(`/api/fetchMonuments?city=${location}`);
        const data = await response.json();
        setMonuments(data);
        setLoadingMonuments(false);
      } catch (error) {
        console.error("Error fetching monuments:", error);
        setLoadingMonuments(false);
      }
    };
    fetchMonuments();
  }, [location, userEmail]);

  useEffect(() => {
    setLoadingMonuments(true);
    const fectchMonumentsByName = async () => {
      try {
        let response;
        if (searchQuery.length != 0) {
          response = await fetch(
            `/api/fetchMonumentsByName?name=${searchQuery}`
          );
        } else {
          response = await fetch(`/api/fetchMonuments?city=${location}`);
        }
        const data = await response.json();
        setMonuments(data);
        setLoadingMonuments(false);
      } catch (error) {
        console.error("Error fetching monuments:", error);
        setLoadingMonuments(false);
      }
    };
    const delayDebounceFn = setTimeout(() => {
      fectchMonumentsByName();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    user && authorizedUsers.includes(user.email)
      ? router.push("https://udaipurinsider.com")
      : null;
  }, [user]);

  // if (loadingUser) {
  //   return <Loader margin={"15rem auto"} />;
  // } else {
  //   if (userEmail.length == 0) {
  //     return <div>Unauthenticated...</div>;
  //   }
  // }
  if (loadingUser) {
    return <Loader margin={"15rem auto"} />;
  } else {
    if (!user) {
      return <div>Unauthenticated...</div>;
    }
  }

  return (
    <div className="wrapper">
      <header className={styles.header}>
        <section className={styles.location}>
          {!locationClick ? (
            <img
              src="/images/location.png"
              alt="Location Icon"
              onClick={(e) => {
                setLocationClick((prev) => !prev);
              }}
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="2.5em"
              height="2.5em"
              onClick={() => {
                setLocationClick((prev) => !prev);
              }}
            >
              <path
                fill="currentColor"
                d="M19.1 4.9C15.2 1 8.8 1 4.9 4.9S1 15.2 4.9 19.1s10.2 3.9 14.1 0s4-10.3.1-14.2m-4.3 11.3L12 13.4l-2.8 2.8l-1.4-1.4l2.8-2.8l-2.8-2.8l1.4-1.4l2.8 2.8l2.8-2.8l1.4 1.4l-2.8 2.8l2.8 2.8z"
              ></path>
            </svg>
          )}
          <section className={styles.text}>
            <h5>Location</h5>
            <h4>{location}</h4>
          </section>
          {locationClick && (
            <section className={styles.dropdown}>
              <ul
                ref={locationRef}
                tabIndex={0}
                onBlur={(e) => {
                  !locationRef.current.contains(e.relatedTarget) &&
                    setLocationClick(false);
                }}
              >
                {cities.map((city) => (
                  <li key={city}>
                    <button
                      onClick={() => {
                        setLocation(city);
                        localStorage.setItem("userCity", city);
                        setLocationClick(false);
                      }}
                      style={
                        location == city
                          ? { color: "white", backgroundColor: "darkgrey" }
                          : null
                      }
                    >
                      {city}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>
        <section className={styles.profile}>
          {!profileClick ? (
            <img
              src="/images/profile.png"
              alt="Profile Icon"
              onClick={() => {
                setProfileClick(!profileClick);
              }}
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="2.5em"
              height="2.5em"
              onClick={() => {
                setProfileClick(!profileClick);
              }}
            >
              <path
                fill="currentColor"
                d="M19.1 4.9C15.2 1 8.8 1 4.9 4.9S1 15.2 4.9 19.1s10.2 3.9 14.1 0s4-10.3.1-14.2m-4.3 11.3L12 13.4l-2.8 2.8l-1.4-1.4l2.8-2.8l-2.8-2.8l1.4-1.4l2.8 2.8l2.8-2.8l1.4 1.4l-2.8 2.8l2.8 2.8z"
              ></path>
            </svg>
          )}
          {profileClick && (
            <section className={styles.dropdown}>
              <ul
                tabIndex={0}
                ref={dropdownRef}
                onBlur={(e) => {
                  !dropdownRef.current.contains(e.relatedTarget) &&
                    setProfileClick(false);
                }} // Here we check onBlur if the click was on this div or not and if it's not then setProfileClick(false);
              >
                <li>
                  <button
                    onClick={() => {
                      router.push("/tickets/current");
                    }}
                  >
                    Current Tickets
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      router.push("/tickets/past");
                    }}
                  >
                    Past Tickets
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      signOut();
                    }}
                  >
                    Log Out
                  </button>
                </li>
              </ul>
            </section>
          )}
        </section>
      </header>
      <form
        className={styles.searchBar}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        style={
          profileClick || locationClick
            ? { filter: "blur(2px)", pointerEvents: "none" }
            : null
        }
      >
        <input
          type="text"
          name="monument"
          id=""
          placeholder="Look up historical sites..."
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
      <section
        className={styles.monumentList}
        style={
          profileClick || locationClick
            ? { filter: "blur(2px)", pointerEvents: "none" }
            : null
        }
      >
        <ul>
          {monuments.length == 0 && !loadingMonuments ? (
            <p
              style={{
                color: "red",
                fontFamily: "var(--font)",
                fontWeight: "bolder",
              }}
            >
              No Monuments Found!
            </p>
          ) : monuments.length != 0 ? (
            monuments.map(
              (monument) =>
                monument.image_url && (
                  <li key={monument.id}>
                    <a
                      href={`booking/${monument.id}`}
                      className={styles.cardLink}
                    >
                      <img src={monument.image_url} alt="Monument Image" />
                      <div className={styles.info}>
                        <h1>{monument.name}</h1>
                        <h4>{capitalizeFirstLetter(monument.city)}</h4>
                      </div>
                    </a>
                  </li>
                )
            )
          ) : (
            // <p style={{ fontFamily: "var(--font)", fontWeight: "bolder" }}>
            //   Loading...
            // </p>
            <Loader />
          )}
        </ul>
      </section>
    </div>
  );
}
