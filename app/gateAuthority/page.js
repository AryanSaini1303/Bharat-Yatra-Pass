"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import styles from "./page.module.css";

export default function GateAuthority() {
  const [ticketId, setTicketId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCode = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    console.log(e.target.qr.value);
  }

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopScanning();
    };
  }, []);

  const startScanning = () => {
    if (isScanning) return; // Prevent multiple instances

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

  return (
    <div className="wrapper">
      <div className={styles.container}>
        <h1 className={styles.title}>Scan Ticket QR Code</h1>
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
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              className={styles.inputField}
              placeholder="Enter Ticket ID"
              name="qr"
            />
            <button onClick={stopScanning} className={styles.btn}>
              Submit
            </button>
          </form>
        </section>
        {ticketId && <p className={styles.resultText}>Ticket ID: {ticketId}</p>}
      </div>
    </div>
  );
}
