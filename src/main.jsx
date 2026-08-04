import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'

// El script de Google (accounts.google.com/gsi/client) exige un client_id no
// vacío incluso solo para inicializarse — si le pasamos '' truena de forma
// síncrona dentro de un useEffect ("Missing required parameter client_id"),
// lo que en React 19 tumba el árbol entero que lo llama. Mientras no exista
// VITE_GOOGLE_CLIENT_ID real, usamos un placeholder: el login con Google
// fallará limpiamente al usarse (en vez de tronar la página al cargar).
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_NOT_CONFIGURED.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
