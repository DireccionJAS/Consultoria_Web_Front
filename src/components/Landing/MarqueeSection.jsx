import React from "react";
import styles from '../../styles/landing/MarqueeSection.module.css';

const ITEMS = [
  { text: "Estados Unidos" },
  { text: "Canadá" },
  { text: "India" },
  { text: "China", em: true },
  { text: "Egipto" },
  { text: "Australia" },
  { text: "eTA Canadá" },
  { text: "ESTA", em: true, suffix: " USA" },
];

export default function MarqueeSection() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <section className={styles.marquee}>
      <div className={styles.marqueeTrack}>
        {doubled.map((item, i) => (
          <span key={i} className={styles.marqueeItem}>
            {item.em ? <em>{item.text}</em> : item.text}
            {item.suffix}
          </span>
        ))}
      </div>
    </section>
  );
}
