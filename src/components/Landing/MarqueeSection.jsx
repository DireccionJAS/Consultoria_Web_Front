import React from "react";
import styles from '../../styles/landing/MarqueeSection.module.css';

const ITEMS = [
  { text: "Estados Unidos", highlight: true },
  { text: "Canadá" },
  { text: "India", highlight: true },
  { text: "China" },
  { text: "Egipto", highlight: true },
  { text: "eTA Canadá", highlight: true },
  { text: "eTA", suffix: " USA" },
];

export default function MarqueeSection() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <section className={styles.marquee}>
      <div className={styles.marqueeTrack}>
        {doubled.map((item, i) => (
          <span key={i} className={styles.marqueeItem}>
            {item.highlight ? <strong className={styles.marqueeHighlight}>{item.text}</strong> : item.text}
            {item.suffix}
          </span>
        ))}
      </div>
    </section>
  );
}
