import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Icon } from '@iconify/react';
import Logo from '../img/logo.png';
import logoutImg from '../img/salida.gif';
import '../styles/Sidebar.css';
import '../styles/SidebarAdmin.css';

export default function NavbarAdmin({ title }) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : true;
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [id1, setId1] = useState("");
  const [id2, setId2] = useState("");
  const [id3, setId3] = useState("");
  const [id4, setId4] = useState("");
  const [id5, setId5] = useState("");
  const [id6, setId6] = useState("");
  const [id7, setId7] = useState("");
  const [id8, setId8] = useState("");
  const [id9, setId9] = useState("");

  // Manejo de rutas responsivas
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Usar las mismas rutas para móvil y desktop
      setId1("/ServiciosAdmin");
      setId2("/TramitesAdmin");
      setId3("/ClientesAdmin");
      setId4("/HomeAdmin");
      setId5("/Pagos");
      setId6("/Perfil");
      setId7("/Calendar");
      setId8("/pdf");
      setId9("/HorariosAdmin");
      
      if (mobile) {
        setSidebarOpen(false); // Cerrar sidebar en mobile al redimensionar
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Guarda el estado del sidebar en localStorage (solo para desktop)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    }
  }, [collapsed, isMobile]);

  function cerrarSesion() {
    Swal.fire({
      icon: 'warning',
      title: '¿Estás seguro que quieres cerrar sesión?',
      showCancelButton: true,
      confirmButtonText: 'Cancelar',
      cancelButtonText: 'Aceptar',
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        window.location.href = '/';
      }
    });
  }

  const handleMenuToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="layout">
      {/* Overlay para móvil */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-left">
          <button className="mobile-menu-btn" onClick={handleMenuToggle}>
            <Icon icon="mdi:menu" />
          </button>
          <div className="navbar-logo">
            <a href="/HomeAdmin"> <img src={Logo} alt="logo" /></a>
           
          </div>
        </div>

        <div className="navbar-title">
          <h1>Consultoría JAS {title}</h1>
        </div>

        <div className="navbar-logout" onClick={cerrarSesion}>
          <Icon icon="line-md:logout" className='icono' />
        </div>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isMobile
          ? (sidebarOpen ? 'mobile-open' : 'mobile-closed')
          : (collapsed ? '' : 'collapsed')
        }`}>

        {!isMobile && (
          <button className="collapse-btn" onClick={handleMenuToggle}>
            <Icon icon="mdi:menu" color="#fff" width="35" />
          </button>
        )}

        <nav className="sidebar-admin-nav">
          <a href={id4} onClick={handleLinkClick}>
            <Icon icon="material-symbols:dashboard" className='icon' />
            <span className="nav-text">Inicio</span>
          </a>
          <a href={id1} onClick={handleLinkClick}>
            <Icon icon="mdi:shopping-outline" className='icon' />
            <span className="nav-text">Servicios</span>
          </a>
          <a href={id2} onClick={handleLinkClick}>
            <Icon icon="carbon:document" className='icon' />
            <span className="nav-text">Trámites</span>
          </a>
          <a href={id3} onClick={handleLinkClick}>
            <Icon icon="mdi:account-group" className='icon' />
            <span className="nav-text">Clientes</span>
          </a>
          <a href={id5} onClick={handleLinkClick}>
            <Icon icon="mdi:cash" className='icon' />
            <span className="nav-text">Pagos</span>
          </a>
          <a href={id7} onClick={handleLinkClick}>
            <Icon icon="mdi:calendar-month" className='icon' />
            <span className="nav-text">Calendario</span>
          </a>
          <a href={id9} onClick={handleLinkClick}>
            <Icon icon="mdi:clock-outline" className='icon' />
            <span className="nav-text">Horarios</span>
          </a>
          <a href={id6} onClick={handleLinkClick}>
            <Icon icon="mdi:account" className='icon' />
            <span className="nav-text">Mi Perfil</span>
          </a>
          <a href={id8} onClick={handleLinkClick}>
            <Icon icon="mdi:document" className='icon' />
            <span className="nav-text">Documentos de la pagina</span>
          </a>
          <a onClick={() => { handleLinkClick(); cerrarSesion(); }}>
            <Icon icon="line-md:logout" className='icon' />
            <span className="nav-text">Cerrar sesión</span>
          </a>
        </nav>
      </div>
    </div>
  );
}
