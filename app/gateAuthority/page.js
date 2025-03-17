"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import styles from "./page.module.css";

export default function GateAuthority() {
  const [ticketId, setTicketId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [ticket, setTicket] = useState({});
  const [verifying, setVerifying] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCode = useRef(null);
  const inputRef = useRef(null);
  const [menuClick, setMenuClick] = useState(false);
  const menuRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    inputRef.current?.blur();
    // console.log(e.target.qr.value);
    setTicketId(e.target.qr.value);
  }

  const startScanning = () => {
    if (isScanning) return; // Prevent multiple instances
    setTicketId("");
    html5QrCode.current = new Html5Qrcode("qr-reader");
    setIsScanning(true);
    html5QrCode.current
      .start(
        { facingMode: "environment" }, // Use rear camera
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
          console.warn("QR Scan Warning:", errorMessage);
        }
      )
      // .then(() => {
      //   setIsScanning(true);
      // })
      .catch((err) => console.error("Error starting scanner:", err));
  };

  const stopScanning = () => {
    if (html5QrCode.current) {
      html5QrCode.current.stop().then(() => {
        html5QrCode.current.clear();
        setIsScanning(false);
      });
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopScanning();
    };
  }, []);

  useEffect(() => {
    const verifyTicket = async () => {
      setVerifying(true);
      try {
        const response = await fetch(`/api/verifyTicket?ticketId=${ticketId}`);
        const data = await response.json();
        setTicket(data);
        console.log(data);
        setVerifying(false);
      } catch (error) {
        console.log(error.message);
        setVerifying(false);
      }
    };
    ticketId.length != 0 && verifyTicket();
  }, [ticketId]);

  return (
    <div className="wrapper">
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
            <ul>
              <li>
                <button>Verified tickets</button>
              </li>
              <li>
                <button>Logout</button>
              </li>
            </ul>
          )}
        </header>
        <section className={styles.qrSection}>
          <div
            id="qr-reader"
            className={styles.scannerBox}
            ref={scannerRef}
            style={isScanning ? { border: "black solid 2px" } : null}
          ></div>
          <div className={styles.buttonContainer}>
            {!isScanning ? (
              <button onClick={startScanning} className={styles.btn}>
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                style={{ backgroundColor: "rgb(206, 0, 0)" }}
                className={styles.btn}
              >
                Stop Scanning
              </button>
            )}
          </div>
        </section>
        <p
          className={styles.infoText}
          style={isScanning ? { filter: "blur(2px)" } : null}
        >
          Or enter manually:
        </p>
        <section className={styles.formSection}>
          <form
            onSubmit={handleSubmit}
            style={
              isScanning ? { filter: "blur(2px)", pointerEvents: "none" } : null
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
                setTicketId("");
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
            <p
              className={styles.resultText}
              style={
                ticket.length != 0
                  ? ticket[0]?.status == "active"
                    ? { color: "green" }
                    : ticket[0]?.status == "expired"
                    ? { color: "red" }
                    : null
                  : verifying
                  ? { color: "black" }
                  : { color: "red" }
              }
            >
              Ticket ID: {ticketId}
            </p>
          )}
          {ticketId && (
            <p
              className="checkerText"
              style={
                ticket.length != 0
                  ? ticket[0]?.status == "active"
                    ? { color: "green" }
                    : ticket[0]?.status == "expired"
                    ? { color: "red" }
                    : null
                  : verifying
                  ? { color: "black" }
                  : { color: "red" }
              }
            >
              {verifying
                ? "Verifying...."
                : ticket.length == 0
                ? "Ticket doesn't exist !"
                : ticket[0]?.status == "active"
                ? "Verified"
                : "Expired !"}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
