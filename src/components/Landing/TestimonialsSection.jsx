import React, { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import styles from '../../styles/Landing/TestimonialsSection.module.css';

export default function TestimonialsSection() {
  const videoIds = [
    "1yqEprSPRX7USlNl2mBriQMN22Z5ZTYPx",
    "17BUblslsO4d0iNXUFrZJjt_g4C3G-Sya",
    "1fMGEVv1H7XodRR9sbFXpWZobYcETVQOA",
    "123Iyc3EM6oJ6BqGm0mZAei9gtCo_GzzM",
    "11KCqJy3G2FrMsxFm5QnRghLQETZAZ3GR",
    "1eoeiepTjQrM5pfCSPrQUcJAE6zsgHiwf",
    "1UmFZwj7_LolAA1rCYpJnp9HtmdiQbcRw",
    "1VXZBF5XIqoq8Jo44iXTRav3sc3UiwnfM",
    "1ZSTDl2Ia-CqNKD13BUVorwQmufuBij_-",
    "1QXlAypI-58YVcJiPgBEiI4HDqLJjBPhj",
    "1ORluy_SDTlyh2DfMj_6mYsy9FtWD5CZu",
    "1xYwZEl6vP3-4Xt-qgIFpQQ6mP13JEpBb",
    "1R6Orp1eZ-xZjT6vLp4coEveVNdpG8wrZ",
    "1M1Z7XuNTOCQGpjGwSaLeBX6YLTgKpb4M",
    "1KI2zYjHEm7PHgkRfN3QUTEfjPgiPoqn6",
    "1t5j3ax1MCS2MQT04rVhkxH3GFN_zzeu_",
    "1pXcgUfA9SxBiXnqnTPecAKk_7Kbj0H6A",
    "1diEtVMdU4enTYkfpocz7I_edDmqpAKs0",
    "1mutQaj0CifflEQ2ILc9BRbupM4fBKSvj",
    "1CthwKjE1GmHXfxrUJ0Tp2Ucz8_0JjpzK",
    "1EWOBgkF-JYks8UJ9B8yPWHk3OnjUKWmv",
    "1dfPBepbibpMQFXIJffUJb0bFDkrueuXe",
    "1iNawH0zM2f9pZAzFET_V4a2sUaQDvquY"
  ];

  // Seleccionar 10 IDs aleatorios
  const selectedVideoIds = useMemo(() => {
    const shuffled = [...videoIds].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 12);
  }, []);

  return (
    <section id="testimonios" className={styles.testimoniosSection}>
      <div className={styles.testimoniosContainer}>
        <div className={styles.testimoniosHeader}>
          <div className={styles.sectionIcon}>
            <MessageSquare size={40} color="#60A5FA" />
          </div>
          <h2 className={styles.testimoniosTitle}>Testimonios</h2>
          <p className={styles.testimoniosDescription}>
            Nuestros clientes comparten sus experiencias positivas con nuestros servicios,
            destacando la eficiencia y profesionalismo de nuestro equipo.
          </p>
        </div>

        <div className={styles.testimoniosGrid}>
          {selectedVideoIds.map((videoId, index) => (
            <div key={index} className={`${styles.testimonioCard} ${styles.fadeInUp}`}>
              <iframe
                src={`https://drive.google.com/file/d/${videoId}/preview`}
                className={styles.testimonioImagenFrame}
                allow="autoplay"
                title={`Testimonio ${index + 1}`}
              />
            </div>
          ))}


        </div>
      </div>
    </section>
  );
}
