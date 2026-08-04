import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../NavbarAdmin.jsx';
// Importamos los estilos como módulo
import styles from './../../styles/ContenedorHome.module.css';
import clientes from '../../img/Clientes.png';
import servicios from '../../img/Servicios.png';
import tramites from '../../img/Tramites.png';
// Deberías agregar tus imágenes para estadísticas y configuración
import calendario from '../../img/Calendario.png'; 
import pagos from '../../img/Pagos.png'; 
import perfil from '../../img/Perfil.png'; 

export default function AdministradorHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "ADMIN") {
        navigate("/");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      navigate("/");
    }

    // Aplica la clase al body para estilos globales si se necesita
    document.body.classList.add('home-admin-body');
    return () => {
      document.body.classList.remove('home-admin-body');
    };
  }, []);

  return (    
    <div className={styles.adminHomeContainer}>
      <div className='fixed-top'>
        <Navbar/>
      </div>
      <div className={styles.contenerCards}>
        <div className={styles.contenedorG}>
          {/* Primera fila: 3 tarjetas */}
          <div className={styles.tarjeta} onClick={() => navigate("/TramitesAdmin")}>
            <img src={tramites} alt="Trámites" />
            <h3>Trámites</h3>
            <p>Trámites Activos</p>
          </div>
          <div className={styles.tarjeta} onClick={() => navigate("/ClientesAdmin")}>
            <img src={clientes} alt="Clientes" />
            <h3>Clientes</h3>
            <p>Gestión de clientes</p>
          </div>
          <div className={styles.tarjeta} onClick={() => navigate("/ServiciosAdmin")}>
            <img src={servicios} alt="Servicios" />
            <h3>Servicios</h3>
            <p>Gestión de servicios</p>
          </div>

          {/* Segunda fila: 3 tarjetas */}
          <div className={styles.tarjeta} onClick={() => navigate("/Calendar")}>
            <img src={calendario} alt="Estadísticas" />
            <h3>Calendario</h3>
            <p>Citas CAS/CON y Simulación</p>
          </div>
          <div className={styles.tarjeta} onClick={() => navigate("/Pagos")}>
            <img src={pagos} alt="Configuración" />
            <h3>Pagos</h3>
            <p>Gestión de pagos</p>
          </div>
          <div className={styles.tarjeta} onClick={() => navigate("/Perfil")}>
            <img src={perfil} alt="Configuración" />
            <h3>Mi Perfil</h3>
            <p>Visualización de mi perfil</p>
          </div>
        </div>
      </div>
    </div>
  );
}