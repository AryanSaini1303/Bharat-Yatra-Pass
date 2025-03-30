import styles from "./loader.module.css";
export default function Loader({margin}) {
  return (
    <div className={styles.newtons_cradle} style={margin?{margin:margin}:null}>
      <div className={styles.newtons_cradle__dot}></div>
      <div className={styles.newtons_cradle__dot}></div>
      <div className={styles.newtons_cradle__dot}></div>
      <div className={styles.newtons_cradle__dot}></div>
    </div>
  );
}
