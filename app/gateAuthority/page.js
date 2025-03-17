"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import styles from "./page.module.css";

export default function GateAuthority() {
  const [ticketId, setTicketId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCode = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopScanning();
    };
  }, []);

  const startScanning = () => {
    if (isScanning) return; // Prevent multiple instances

    html5QrCode.current = new Html5Qrcode("qr-reader");

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
      .then(() => {
        setIsScanning(true);
      })
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
    <div className={styles.container}>
      <h1 className={styles.title}>Scan Ticket QR Code</h1>

      <div id="qr-reader" className={styles.scannerBox} ref={scannerRef}></div>

      <div className={styles.buttonContainer}>
        {!isScanning ? (
          <button className={styles.startButton} onClick={startScanning}>
            Start Scanning
          </button>
        ) : (
          <button className={styles.stopButton} onClick={stopScanning}>
            Stop Scanning
          </button>
        )}
      </div>

      <p className={styles.infoText}>Or enter manually:</p>
      <input
        type="text"
        value={ticketId}
        onChange={(e) => setTicketId(e.target.value)}
        className={styles.inputField}
        placeholder="Enter Ticket ID"
      />

      {ticketId && <p className={styles.resultText}>Ticket ID: {ticketId}</p>}
    </div>
  );
}
