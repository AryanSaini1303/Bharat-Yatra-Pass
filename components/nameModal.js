'use client';

import styles from './nameModal.module.css';

export default function NameModal({ isOpen, onClose, onSubmit }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    if (name) onSubmit(name);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.modalClose} onClick={onClose}>
          &times;
        </button>
        <h2 className={styles.modalTitle}>Enter Name</h2>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            className={styles.modalInput}
          />
          <button type="submit" className={styles.modalButton}>
            Proceed
          </button>
        </form>
      </div>
    </div>
  );
}
