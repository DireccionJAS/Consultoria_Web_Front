import { createContext, useContext, useEffect, useState } from 'react';
import { getPdfLegalUrl } from '../../api/api.js';
import { COOKIE_EVENT, COOKIE_KEY, COOKIE_OPEN_EVENT, readPreferences, savePreferences } from '../../utils/cookiePreferences.js';
import styles from '../../styles/CookieNotice.module.css';

const CookieContext = createContext({ maps: false });
export const useCookiePreferences = () => useContext(CookieContext);

function storedPreferences() {
  try { return readPreferences(window.localStorage); } catch { return null; }
}

export default function CookieNotice({ children }) {
  const [preferences, setPreferences] = useState(storedPreferences);
  const [open, setOpen] = useState(() => !storedPreferences());
  useEffect(() => {
    const show = () => setOpen(true);
    const sync = (event) => {
      if (event.key !== COOKIE_KEY && event.key !== null) return;
      const value = storedPreferences();
      setPreferences(value);
      if (!value) setOpen(true);
    };
    window.addEventListener(COOKIE_OPEN_EVENT, show);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(COOKIE_OPEN_EVENT, show);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const choose = (maps) => {
    let value;
    try { value = savePreferences(window.localStorage, maps); }
    catch { value = savePreferences({ setItem() {} }, maps); }
    setPreferences(value);
    setOpen(false);
    window.dispatchEvent(new Event(COOKIE_EVENT));
  };
  return (
    <CookieContext.Provider value={{ maps: preferences?.maps === true }}>
      {children}
      {open && <section className={styles.notice} aria-labelledby="cookie-notice-title" aria-label="Preferencias de cookies">
        <div className={styles.copy}>
          <h2 id="cookie-notice-title">Tu privacidad, tus preferencias</h2>
          <p>Usamos almacenamiento del navegador para tu sesión y tus preferencias. Los servicios de acceso y pago pueden utilizar cookies técnicas al usarlos. Los mapas de Google son opcionales y solo se cargan si los permites.</p>
          <p>Puedes cambiar tu elección en «Aviso de cookies», al pie de la página. <a href={getPdfLegalUrl('privacidad')} target="_blank" rel="noreferrer">Consultar privacidad</a>.</p>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={() => choose(false)}>Solo necesarias</button>
          <button type="button" className={styles.allow} onClick={() => choose(true)}>Permitir mapas</button>
        </div>
      </section>}
    </CookieContext.Provider>
  );
}
