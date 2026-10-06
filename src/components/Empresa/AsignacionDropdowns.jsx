import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import { listarEncargados, getEmpresas, asignarEncargadoCliente, cambiarEmpresaCliente } from './../../api/api.js';
import styles from './../../styles/AsignacionDropdowns.module.css';
import logoJas from './../../assets/empresas/logo-jas.png';
import logoCmg from './../../assets/empresas/logo-cmg.png';

// Columnas "Encargado" y "Empresa" de las tablas del panel Empresa
// (Trámites y Clientes). Ambas son del CLIENTE (user.encargado /
// user.empresa): cambiarlas desde un trámite afecta a todos sus trámites.

const EMPRESA_UI = {
  JAS: { corto: 'C.JAS', logo: logoJas },
  CMG: { corto: 'COR.M', logo: logoCmg },
};

function ChevronDownIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>; }
function CheckIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>; }

// "Nahily Dominguez Pérez" → "Nahily D."
function nombreCorto(nombre) {
  const partes = (nombre || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '';
  return partes.length === 1 ? partes[0] : `${partes[0]} ${partes[1][0].toUpperCase()}.`;
}

function iniciales(nombre) {
  const partes = (nombre || '').trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] || '') + (partes[1]?.[0] || '')).toUpperCase() || '?';
}

// Catálogos (admins activos y empresas) compartidos por todas las filas.
export function useCatalogosAsignacion() {
  const [admins, setAdmins] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  useEffect(() => {
    listarEncargados()
      .then((r) => setAdmins(r.success && Array.isArray(r.response.users) ? r.response.users.filter((a) => !a.archived) : []))
      .catch(() => setAdmins([]));
    getEmpresas()
      .then((r) => setEmpresas(r.success && Array.isArray(r.response.empresas) ? r.response.empresas : []))
      .catch(() => setEmpresas([]));
  }, []);
  return { admins, empresas };
}

// Menú flotante en <body> (position: fixed) para que la tabla con scroll no
// lo recorte; se abre hacia arriba si no cabe abajo.
function Dropdown({ trigger, children, disabled }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const fuera = (e) => {
      if (ref.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, []);

  useLayoutEffect(() => {
    if (!open) { setPos(null); return undefined; }
    const ubicar = () => {
      if (!ref.current || !menuRef.current) return;
      const r = ref.current.getBoundingClientRect();
      const alto = menuRef.current.offsetHeight;
      const ancho = menuRef.current.offsetWidth;
      const espacioAbajo = window.innerHeight - r.bottom;
      const haciaArriba = espacioAbajo < alto + 12 && r.top > espacioAbajo;
      setPos({
        top: haciaArriba ? Math.max(8, r.top - alto - 6) : r.bottom + 6,
        left: Math.max(8, Math.min(r.left, window.innerWidth - ancho - 8)),
      });
    };
    ubicar();
    window.addEventListener('scroll', ubicar, true);
    window.addEventListener('resize', ubicar);
    return () => {
      window.removeEventListener('scroll', ubicar, true);
      window.removeEventListener('resize', ubicar);
    };
  }, [open]);

  return (
    <div className={styles.dd} ref={ref}>
      <button type="button" className={styles.trigger} disabled={disabled} onClick={() => setOpen((o) => !o)}>
        {trigger}
        <span className={styles.chev}><ChevronDownIcon /></span>
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          className={styles.menu}
          style={pos ? { top: pos.top, left: pos.left } : { top: 0, left: 0, visibility: 'hidden' }}
        >
          {children(() => setOpen(false))}
        </div>,
        document.body
      )}
    </div>
  );
}

function Opcion({ sel, onClick, children }) {
  return (
    <div className={`${styles.opt} ${sel ? styles.sel : ''}`} onClick={onClick}>
      {children}
      {sel && <span className={styles.check}><CheckIcon /></span>}
    </div>
  );
}

function AvatarEncargado({ nombre }) {
  return nombre
    ? <span className={styles.avatar}>{iniciales(nombre)}</span>
    : <span className={`${styles.avatar} ${styles.avatarEmpresa}`}>EM</span>;
}

async function confirmar(titulo, texto) {
  const r = await Swal.fire({
    icon: 'question', title: titulo, text: texto,
    showCancelButton: true, confirmButtonText: 'Sí, cambiar', cancelButtonText: 'Cancelar',
    confirmButtonColor: '#2D6CDF',
  });
  return r.isConfirmed;
}

async function guardar(promesa, onChanged) {
  try {
    const r = await promesa;
    if (r && r.success === false) throw new Error(r.message);
    Swal.fire({ icon: 'success', title: 'Listo', text: r?.message || 'Cambio guardado', showConfirmButton: false, timer: 1800 });
    onChanged?.();
  } catch (e) {
    Swal.fire({ icon: 'error', title: 'Error', text: e?.message || 'No se pudo guardar el cambio.' });
  }
}

// Sin encargado = lo atiende Empresa.
export function EncargadoDropdown({ idUser, clienteNombre, encargadoId, encargadoName, admins, onChanged }) {
  const elegir = async (admin, cerrar) => {
    cerrar();
    const nuevoId = admin ? admin.idUser : null;
    if ((encargadoId ?? null) === nuevoId) return;
    const destino = admin ? admin.name : 'Empresa';
    if (!(await confirmar('¿Cambiar encargado?', `${clienteNombre || 'El cliente'} y todos sus trámites pasarán a ${destino}.`))) return;
    guardar(asignarEncargadoCliente(idUser, nuevoId), onChanged);
  };

  return (
    <Dropdown
      disabled={!idUser}
      trigger={(
        <span className={styles.cell}>
          <AvatarEncargado nombre={encargadoName} />
          {encargadoName
            ? <span className={styles.nombre}>{nombreCorto(encargadoName)}</span>
            : <span className={styles.nombreEmpresa}>Empresa</span>}
        </span>
      )}
    >
      {(cerrar) => (
        <>
          <Opcion sel={!encargadoId} onClick={() => elegir(null, cerrar)}>
            <AvatarEncargado nombre={null} /> <span className={styles.nombreEmpresa}>Empresa</span>
          </Opcion>
          {admins.map((a) => (
            <Opcion key={a.idUser} sel={a.idUser === encargadoId} onClick={() => elegir(a, cerrar)}>
              <AvatarEncargado nombre={a.name} /> {a.name}
            </Opcion>
          ))}
        </>
      )}
    </Dropdown>
  );
}

function LogoEmpresa({ code }) {
  const ui = EMPRESA_UI[code];
  return ui
    ? <img className={styles.logo} src={ui.logo} alt={code} />
    : <span className={`${styles.logo} ${styles.logoTexto}`}>{code ? code.slice(0, 3) : '—'}</span>;
}

export function EmpresaDropdown({ idUser, clienteNombre, empresaCode, empresas, onChanged }) {
  const elegir = async (empresa, cerrar) => {
    cerrar();
    if (empresa.code === empresaCode) return;
    if (!(await confirmar('¿Cambiar empresa?', `${clienteNombre || 'El cliente'} pasará a ${empresa.name}.`))) return;
    guardar(cambiarEmpresaCliente(idUser, empresa.idEmpresa), onChanged);
  };

  return (
    <Dropdown
      disabled={!idUser}
      trigger={(
        <span className={styles.cell}>
          <LogoEmpresa code={empresaCode} />
          <span className={styles.nombre}>{EMPRESA_UI[empresaCode]?.corto || empresaCode || 'Sin empresa'}</span>
        </span>
      )}
    >
      {(cerrar) => empresas.map((e) => (
        <Opcion key={e.idEmpresa} sel={e.code === empresaCode} onClick={() => elegir(e, cerrar)}>
          <LogoEmpresa code={e.code} /> {e.name}
        </Opcion>
      ))}
    </Dropdown>
  );
}
