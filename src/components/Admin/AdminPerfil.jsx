import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import AdminSidebar from './AdminSidebar.jsx';
import { clientePorId, actualizarContra } from './../../api/api.js';
import styles from './../../styles/AdminPerfil.module.css';

// Extraído 1:1 de "12-Perfil (standalone).html" (mismo componente que
// EmpresaPerfil.jsx, adaptado a AdminSidebar). "Información personal" usa
// datos reales del usuario (GET /users/{id}, igual que AdministradorPerfil.jsx)
// y es de solo lectura: no hay backend para que el propio usuario edite su
// nombre/correo/teléfono. "Cambiar contraseña" sí persiste de verdad contra
// PUT /users/password/{id} (actualizarContra). La "Ubicación" (Jiutepec) es
// fija como en el mockup: no existe un campo de ubicación por usuario.

function IconPerson({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4"></circle><path d="M3 21v-1a7 7 0 0 1 14 0v1"></path></svg>; }
function IconMail({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6"></path></svg>; }
function IconPhone({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>; }
function IconStar({ size = 17 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1-6.3-4.6L5.7 21 8 13.9 2 9.4h7.6z"></path></svg>; }
function IconLock({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>; }
function IconClock({ size = 13 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>; }
function IconEye({ size = 15 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>; }
function IconCheck({ size = 13 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7"></path></svg>; }
function IconCheckThin({ size = 11 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7"></path></svg>; }
function IconInfo() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>; }

function initials(name) {
  const parts = (name || '').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

function formatActivaDesde(createdAt) {
  if (!createdAt) return '';
  const fecha = new Date(createdAt.replace(' ', 'T'));
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }).replace('.', '');
}

const REQS = [
  { key: 'len', label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { key: 'upper', label: 'Una mayúscula', test: (p) => /[A-Z]/.test(p) },
  { key: 'num', label: 'Un número', test: (p) => /[0-9]/.test(p) },
  { key: 'sym', label: 'Un símbolo especial', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function AdminPerfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [datos, setDatos] = useState(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'ADMIN') { navigate('/'); return; }
      setUsuario(decoded.idUser);
    } catch (error) {
      console.error('Token inválido', error);
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (!usuario) return;
    const fetchUsuario = async () => {
      try {
        const response = await clientePorId(usuario);
        if (response.success && response.response.user) {
          setDatos(response.response.user);
        } else {
          console.error('Formato inesperado:', response);
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      }
    };
    fetchUsuario();
  }, [usuario]);

  const handleNavigate = (key) => { console.log('Navegar a sección de sidebar:', key); };

  const reqsMet = REQS.map((r) => ({ ...r, met: r.test(password) }));
  const allReqsMet = reqsMet.every((r) => r.met);
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password;
  const puedeGuardar = allReqsMet && passwordsMatch && !guardando;

  const resetForm = () => {
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleActualizarContra = async (e) => {
    e.preventDefault();
    if (!puedeGuardar) return;
    setGuardando(true);
    try {
      await actualizarContra(usuario, password);
      Swal.fire({ icon: 'success', title: 'Éxito', text: 'Contraseña actualizada con éxito' });
      resetForm();
    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error al actualizar la contraseña.' });
    } finally {
      setGuardando(false);
    }
  };

  if (!datos) {
    return (
      <div className={styles.page}>
        <AdminSidebar active="perfil" onNavigate={handleNavigate} />
        <main className={styles.main}>
          <div className={styles.content} style={{ padding: '32px' }}>Cargando...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AdminSidebar active="perfil" onNavigate={handleNavigate} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Sistema</span> <span className={styles.accent} style={{ color: 'var(--muted-2)' }}>/</span> <span className={styles.accent}>Mi perfil</span></div>
            <div className={styles.pageTitle}>Mi perfil</div>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.profHero}>
            <div className={styles.profAvatar}>{initials(datos.name)}</div>
            <div className={styles.profInfo}>
              <div className={styles.profName}>{datos.name}</div>
              <div className={styles.profRole}><IconStar size={11} /> Admin · Jiutepec</div>
              <div className={styles.profMeta}>
                <span className={styles.profMetaItem}><IconMail size={13} /> {datos.email}</span>
                {datos.createdAt && (
                  <span className={styles.profMetaItem}><IconClock /> Activo desde {formatActivaDesde(datos.createdAt)}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.secHead}>
              <div className={styles.secIcon}><IconPerson size={18} /></div>
              <div><div className={styles.secTitle}>Información personal</div><div className={styles.secSub}>Tus datos registrados en el sistema</div></div>
              <span className={styles.secReadonly}>Solo lectura</span>
            </div>
            <div className={styles.secBody}>
              <div className={styles.grid2}>
                <div className={styles.roRow}>
                  <div className={styles.roIcon}><IconPerson /></div>
                  <div><div className={styles.roLbl}>Nombre completo</div><div className={styles.roVal}>{datos.name}</div></div>
                  <span className={styles.roLock}><IconLock size={14} /></span>
                </div>
                <div className={styles.roRow}>
                  <div className={styles.roIcon}><IconMail /></div>
                  <div><div className={styles.roLbl}>Correo electrónico</div><div className={styles.roVal}>{datos.email}</div></div>
                  <span className={styles.roLock}><IconLock size={14} /></span>
                </div>
                <div className={styles.roRow}>
                  <div className={styles.roIcon}><IconPhone /></div>
                  <div><div className={styles.roLbl}>Teléfono</div><div className={styles.roVal}>{datos.phone}</div></div>
                  <span className={styles.roLock}><IconLock size={14} /></span>
                </div>
                <div className={styles.roRow}>
                  <div className={styles.roIcon}><IconStar /></div>
                  <div><div className={styles.roLbl}>Rol</div><div className={styles.roVal}>Admin</div></div>
                  <span className={styles.roLock}><IconLock size={14} /></span>
                </div>
              </div>
              <div className={`${styles.fieldMsg} ${styles.hint}`} style={{ marginTop: 14 }}>
                <IconInfo /> Para modificar tu nombre, correo o teléfono, contacta al Super Administrador del sistema.
              </div>
            </div>
          </div>

          <form className={styles.section} onSubmit={handleActualizarContra}>
            <div className={styles.secHead}>
              <div className={`${styles.secIcon} ${styles.amber}`}><IconLock size={18} /></div>
              <div><div className={styles.secTitle}>Cambiar contraseña</div><div className={styles.secSub}>Actualiza tu contraseña de acceso al panel</div></div>
            </div>
            <div className={styles.secBody}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Nueva contraseña <span className={styles.req}>*</span></label>
                <div className={`${styles.inpWrap} ${password ? (allReqsMet ? styles.valid : '') : ''}`}>
                  <span className={styles.inpIcon}><IconLock size={16} /></span>
                  <input
                    className={styles.inp}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu nueva contraseña"
                  />
                  <button type="button" className={styles.inpToggle} onClick={() => setShowPassword((s) => !s)}><IconEye /></button>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Confirmar nueva contraseña <span className={styles.req}>*</span></label>
                <div className={`${styles.inpWrap} ${confirmPassword ? (passwordsMatch ? styles.valid : styles.error) : ''}`}>
                  <span className={styles.inpIcon}><IconLock size={16} /></span>
                  <input
                    className={styles.inp}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                  />
                  {confirmPassword && passwordsMatch ? (
                    <span className={styles.inpValidIcon}><IconCheck size={16} /></span>
                  ) : (
                    <button type="button" className={styles.inpToggle} onClick={() => setShowConfirmPassword((s) => !s)}><IconEye /></button>
                  )}
                </div>
                {confirmPassword && (
                  passwordsMatch
                    ? <div className={`${styles.fieldMsg} ${styles.ok}`}><IconCheckThin /> Las contraseñas coinciden</div>
                    : <div className={`${styles.fieldMsg} ${styles.error}`}>Las contraseñas no coinciden</div>
                )}
              </div>

              <div className={styles.pwReqs}>
                {reqsMet.map((r) => (
                  <div key={r.key} className={`${styles.pwReq} ${r.met ? styles.met : ''}`}>
                    <span className={styles.pwReqDot}><IconCheckThin size={10} /></span> {r.label}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.secFoot}>
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={resetForm} disabled={guardando}>Cancelar</button>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={!puedeGuardar}>
                {guardando ? 'Actualizando...' : 'Actualizar contraseña'} <IconCheck />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
