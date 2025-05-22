'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import styles from './page.module.css';
import { supabase } from '@/lib/supabaseClient';
import { Noto_Sans } from 'next/font/google';
import { useRouter } from 'next/navigation';

const notoSans = Noto_Sans({
  weight: '400',
  subsets: ['latin'],
});

export default function GateAuthority() {
  const [ticketId, setTicketId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [ticket, setTicket] = useState([]);
  const [verifying, setVerifying] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCode = useRef(null);
  const inputRef = useRef(null);
  const [menuClick, setMenuClick] = useState(false);
  const menuRef = useRef(null);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const authorizedEmail = [
    'saini.aryan9999@gmail.com',
    'yograj.rr@gmail.com',
    'saurabhgodawat@gmail.com',
  ];
  const [counter, setCounter] = useState(5);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    inputRef.current?.blur();
    // console.log(e.target.qr.value);
    setTicketId(e.target.qr.value);
  }

  const startScanning = () => {
    if (isScanning) return; // Prevent multiple instances
    setTicketId('');
    html5QrCode.current = new Html5Qrcode('qr-reader');
    setIsScanning(true);
    html5QrCode.current
      .start(
        { facingMode: 'environment' }, // Use rear camera
        {
          fps: 10,
          qrbox: 250, // Defines scanning box size
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
        },
        (decodedText) => {
          setTicketId(decodedText);
          stopScanning(); // Stop scanning after successful detection
        },
        (errorMessage) => {
          console.warn('QR Scan Warning:', errorMessage);
        },
      )
      // .then(() => {
      //   setIsScanning(true);
      // })
      .catch((err) => console.error('Error starting scanner:', err));
  };

  const stopScanning = () => {
    if (html5QrCode.current) {
      html5QrCode.current.stop().then(() => {
        html5QrCode.current.clear();
        setIsScanning(false);
      });
    }
  };

  const signIn = async (redirectPath = '/gateAuthority') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`,
        queryParams: {
          prompt: 'select_account', // Forces google to always show account selection
        },
      },
    });

    if (error) {
      console.error('Authentication Error:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/gateAuthority'); // Redirect after successful sign-out
    } catch (err) {
      console.error('Error signing out:', err.message);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopScanning();
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        setCounter((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    if (counter == 0) {
      setTicketId('');
      setCounter(5);
      setTicket([]);
      window.location.reload();
    }
  }, [counter]);

  useEffect(() => {
    if (menuClick && menuRef.current) {
      menuRef.current.focus();
    }
  }, [menuClick]);

  useEffect(() => {
    if (!user) return;

    if (authorizedEmail.includes(user.email)) {
      router.push('/gateAuthority');
    } else {
      alert('You are not authorized to access this page!');
      signOut();
    }
  }, [user]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
          const { user } = session;
          setUser(user);
          // console.log(user);
        } else {
          setUser(null);
        }
      },
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const verifyTicket = async () => {
      setVerifying(true);
      try {
        const response = await fetch(`/api/verifyTicket?ticketId=${ticketId}`);
        const data = await response.json();
        // await delay(2000); // Simulates network delay
        setTicket(data);
        setLoading(false);
        // console.log(data);
        if (inputRef.current) {
          inputRef.current.value = ''; // Clears the input
        }
        setVerifying(false);
      } catch (error) {
        console.log(error.message);
        setVerifying(false);
      }
    };
    ticketId.length != 0 && verifyTicket();
  }, [ticketId]);

  useEffect(() => {
    // console.log(ticket);
    if (ticket[0]?.ticketId && ticket[0]?.status == 'active') {
      const expireTicket = async () => {
        try {
          const { data, error } = await supabase
            .from('tickets')
            .update({ status: 'expired', verifierId: user?.id })
            .eq('ticketId', ticket[0].ticketId)
            .select(); // Ensures it returns the updated data
          if (error) {
            console.error('Supabase Error:', error.message);
          } else {
            // console.log("Ticket status updated:", data);
          }
        } catch (err) {
          console.error('Unexpected Error:', err.message);
        }
      };
      expireTicket();
    }
  }, [ticket]);

  return (
    <div className="wrapper">
      {user && authorizedEmail.includes(user.email) ? (
        <div className={styles.container}>
          <header>
            <h1 className={styles.title}>Scan QR Ticket</h1>
            <div className={styles.hamburger}>
              {!menuClick ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 14 14"
                  width="2em"
                  height="2em"
                  onClick={() => {
                    setMenuClick((prev) => !prev);
                  }}
                >
                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 13.5a6.5 6.5 0 1 0 0-13a6.5 6.5 0 0 0 0 13"></path>
                    <path d="M4 7.25a.25.25 0 0 1 0-.5m0 .5a.25.25 0 0 0 0-.5m3 .5a.25.25 0 0 1 0-.5m0 .5a.25.25 0 0 0 0-.5m3 .5a.25.25 0 0 1 0-.5m0 .5a.25.25 0 1 0 0-.5"></path>
                  </g>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 14 14"
                  width="2em"
                  height="2em"
                  onClick={() => {
                    setMenuClick((prev) => !prev);
                  }}
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M7 14A7 7 0 1 0 7 0a7 7 0 0 0 0 14M4 8a1 1 0 1 0 0-2a1 1 0 0 0 0 2m4-1a1 1 0 1 1-2 0a1 1 0 0 1 2 0m2 1a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
                    clipRule="evenodd"
                  ></path>
                </svg>
              )}
            </div>
            {menuClick && (
              <ul
                ref={menuRef}
                tabIndex={0}
                onBlur={(e) => {
                  !menuRef.current.contains(e.relatedTarget) &&
                    setMenuClick(false);
                }}
              >
                <li>
                  <button
                    onClick={() => {
                      router.push('/gateAuthority/verifiedTickets');
                    }}
                  >
                    Verified tickets
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      signOut();
                    }}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            )}
          </header>
          <section
            style={
              menuClick
                ? { filter: 'blur(2px)', transition: '0.2s all ease-in-out' }
                : null
            }
          >
            <section className={styles.qrSection}>
              <div
                id="qr-reader"
                className={styles.scannerBox}
                ref={scannerRef}
                style={isScanning ? { border: 'black solid 2px' } : null}
              ></div>
              <div className={styles.buttonContainer}>
                {!isScanning ? (
                  <button onClick={startScanning} className={styles.btn}>
                    Start Scanning
                  </button>
                ) : (
                  <button
                    onClick={stopScanning}
                    style={{ backgroundColor: 'rgb(206, 0, 0)' }}
                    className={styles.btn}
                  >
                    Stop Scanning
                  </button>
                )}
              </div>
            </section>
            <p
              className={styles.infoText}
              style={isScanning ? { filter: 'blur(2px)' } : null}
            >
              Or enter manually:
            </p>
            <section className={styles.formSection}>
              <form
                onSubmit={handleSubmit}
                style={
                  isScanning
                    ? { filter: 'blur(2px)', pointerEvents: 'none' }
                    : null
                }
              >
                <input
                  type="text"
                  // value={ticketId}
                  className={styles.inputField}
                  placeholder="Enter Ticket ID"
                  name="qr"
                  tabIndex={0}
                  onFocus={() => {
                    setTicketId('');
                  }}
                  ref={inputRef}
                />
                <button onClick={stopScanning} className={styles.btn}>
                  Submit
                </button>
              </form>
            </section>
            <section className={styles.result}>
              {ticketId && (
                <div className={styles.resultContainer}>
                  {verifying ? (
                    'Verifying....'
                  ) : ticket.length == 0 ? (
                    <div className={styles.resultInfo}>
                      <img src="/gif/failed.gif" alt="" />
                      <p
                        style={
                          ticket.length != 0
                            ? ticket[0]?.status == 'active'
                              ? { color: 'green' }
                              : ticket[0]?.status == 'expired'
                              ? { color: 'red' }
                              : null
                            : verifying
                            ? { color: 'black' }
                            : { color: 'red' }
                        }
                      >
                        Ticket doesn&apos;t exist !
                      </p>
                    </div>
                  ) : ticket[0]?.status == 'active' ? (
                    <div className={styles.resultInfo}>
                      <img src="/gif/done.gif" alt="" />
                      <p
                        style={
                          ticket.length != 0
                            ? ticket[0]?.status == 'active'
                              ? { color: 'green' }
                              : ticket[0]?.status == 'expired'
                              ? { color: 'red' }
                              : null
                            : verifying
                            ? { color: 'black' }
                            : { color: 'red' }
                        }
                      >
                        Verified
                      </p>
                    </div>
                  ) : (
                    <div className={styles.resultInfo}>
                      <img src="/gif/failed.gif" alt="" />
                      <p
                        style={
                          ticket.length != 0
                            ? ticket[0]?.status == 'active'
                              ? { color: 'green' }
                              : ticket[0]?.status == 'expired'
                              ? { color: 'red' }
                              : null
                            : verifying
                            ? { color: 'black' }
                            : { color: 'red' }
                        }
                      >
                        Ticket is expired !
                      </p>
                    </div>
                  )}
                  <p
                    className={styles.resultText}
                    style={
                      ticket.length != 0
                        ? ticket[0]?.status == 'active'
                          ? { color: 'green' }
                          : ticket[0]?.status == 'expired'
                          ? { color: 'red' }
                          : null
                        : verifying
                        ? { color: 'black' }
                        : { color: 'red' }
                    }
                  >
                    Ticket ID: {ticketId}
                  </p>
                  {!loading && (
                    <button
                      onClick={() => {
                        setCounter(0);
                      }}
                      className={styles.okbtn}
                    >
                      Scan next <span>{counter}</span>
                    </button>
                  )}
                </div>
              )}
            </section>
          </section>
        </div>
      ) : (
        <div className={styles.loginPage}>
          <div className={styles.content}>
            <header className={styles.header}>
              <h1>Gate Authority</h1>
              <h5>
                Effortless ticket verification for India&apos;s historic
                landmarks &ndash; Quick, Secure, and Reliable!
              </h5>
            </header>
            <button
              onClick={() => signIn()}
              className={`${styles.googleLogin} ${notoSans.className}`}
            >
              <img src={'/images/googleLogo.png'} alt="Google Logo" />
              <h3> Sign In With Google</h3>
            </button>
          </div>
          <img
            src="/images/background-mobile.png"
            alt="Background Monuments"
            className={styles.background}
          />
        </div>
      )}
    </div>
  );
}

/*This is the policy i've used on tickets table in supabase to allow only authorized users to update their own tickets
CREATE POLICY "Allow users to update their own tickets"
ON tickets
FOR UPDATE
USING (user_id = auth.uid());*/
/*But the above policy is for the users not the gate authority individuals to change user data so the updated policy is 
the update policy where the logged in user id is matched in the gate_authority_users table to verify the gate authority official by using
(select auth.uid()) in (select verifier_id from gate_authority_users) */
