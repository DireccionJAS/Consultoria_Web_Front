import React, { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import styles from '../../styles/landing/TestimonialsSection.module.css';

export default function TestimonialsSection() {
  // Corrected useState destructuring
  const [videosIds, setVideosIds] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state back
  const [error, setError] = useState(null);     // Added error state back
  const [lengthArray, setLengthArray] = useState(0); // Added lengthArray state

  const folderId = "1QnjhCrysPgz6gNILAAVpxtrRSEAYpp74"; // tu carpeta
  const apiKey = "AIzaSyDlorWPzhf2zFW7YBA9YE4Vqyutg7DVKOw";
  

  useEffect(() => {
    const fetchDriveVideos = async () => { // Renamed for clarity to avoid confusion with fetchImages in previous examples
      try {
        setLoading(true); // Set loading true at the start of fetch

        const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType,webViewLink)`;

        const response = await fetch(url);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status} - ${data.error?.message || response.statusText}`);
        }

        if (data.error) {
          throw new Error(`Error de API: ${data.error.message}`);
        }

        if (!data.files) {
          console.warn("No se recibieron archivos en la respuesta de la API.");
          setLoading(false);
          return; // Exit if no files
        }


        // Mezclar y tomar solo 9 IDs al azar
        function getRandomSample(arr, n) {
          const shuffled = arr.slice().sort(() => 0.5 - Math.random());
          return shuffled.slice(0, n);
        }
        const driveVideoIds = data.files.map(file => file.id);
        const randomIds = getRandomSample(driveVideoIds, 9);
        setVideosIds(randomIds);
        setLengthArray(driveVideoIds.length);

      } catch (e) {
        console.error("Error al cargar videos de Google Drive:", e);
        setError(e.message); // Set error message
      } finally {
        setLoading(false); // Set loading false after fetch is complete (success or error)
      }
    };

    fetchDriveVideos(); // Call the async function

  }, []); // Empty dependency array means this useEffect runs once on mount

  if (loading) {
    return (
      <section id="testimonios" className={styles.testimoniosSection}>
        <div className={styles.loadingMessage}>Cargando testimonios...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="testimonios" className={styles.testimoniosSection}>
        <div className={styles.errorMessage}>
          Error al cargar testimonios: {error}
        </div>
      </section>
    );
  }


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
          {videosIds.length > 0 ? (
            videosIds.map((videoId, index) => (
              <div key={videoId} className={`${styles.testimonioCard} ${styles.fadeInUp}`}> {/* Use videoId as key for better performance */}
                <iframe
                  src={`https://drive.google.com/file/d/${videoId}/preview`}
                  className={styles.testimonioImagenFrame}
                  allow="autoplay"
                  allowFullScreen // Good practice for iframes, especially for video
                  title={`Testimonio ${index + 1}`}
                />
              </div>
            ))
          ) : (
            <div className={styles.noTestimoniosMessage}>
              No hay testimonios disponibles.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}