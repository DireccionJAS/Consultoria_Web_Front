import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ClienteSidebar from './ClienteSidebar.jsx';
import { clientePorId, actualizar, actualizarContra } from './../../api/api.js';
import styles from './../../styles/ClienteMiPerfil.module.css';
import HeaderLogoutButton from './../common/HeaderLogoutButton.jsx';

function MailIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6" /></svg>; }
function CheckIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>; }
function UserIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4" /><path d="M3 21v-1a7 7 0 0 1 14 0v1" /></svg>; }
function PhoneIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>; }
function LockIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>; }
function EditIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>; }
function EyeIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>; }

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const schema = yup.object().shape({
  password: yup.string().required('Campo obligatorio').min(6, 'Mínimo 6 caracteres'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir').required('Confirma tu contraseña'),
});

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function MiPerfil() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [datos, setDatos] = useState(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    let idUser;
    try {
      const decoded = jwtDecode(token);
      idUser = decoded.idUser;
      setUserId(idUser);
      if (decoded.role !== 'USER') {
        Swal.fire({ icon: 'error', title: 'Acceso denegado', text: 'No tienes permiso para acceder a esta página.' });
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Token inválido', error);
      localStorage.removeItem('token');
      navigate('/');
      return;
    }
    cargarDatos(idUser);
  }, [navigate]);

  const cargarDatos = async (idUser) => {
    try {
      const response = await clientePorId(idUser);
      if (response.success && response.response.user) {
        setDatos(response.response.user);
        setForm({ name: response.response.user.name, email: response.response.user.email, phone: response.response.user.phone });
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  };

  const cancelarEdicion = () => {
    setForm({ name: datos.name, email: datos.email, phone: datos.phone });
    setEditando(false);
  };

  const validarPerfil = () => {
    if (!form.name.trim()) return 'El nombre es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Ingresa un correo electrónico válido.';
    if (!form.phone.trim()) return 'El teléfono es obligatorio.';
    return null;
  };

  const guardarPerfil = async () => {
    const errorValidacion = validarPerfil();
    if (errorValidacion) {
      Swal.fire({ icon: 'warning', title: 'Revisa tus datos', text: errorValidacion });
      return;
    }
    setGuardandoPerfil(true);
    try {
      await actualizar(userId, { name: form.name, email: form.email, phone: form.phone, status: datos.status });
      await cargarDatos(userId);
      setEditando(false);
      Swal.fire({ icon: 'success', title: 'Éxito', text: 'Perfil actualizado con éxito' });
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar tu perfil.' });
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      await actualizarContra(userId, data.password);
      Swal.fire({ icon: 'success', title: 'Éxito', text: 'Contraseña actualizada con éxito' });
      reset();
    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error al actualizar la contraseña.' });
    }
  };

  if (!datos) return null;

  const desde = datos.createdAt ? new Date(datos.createdAt.replace(' ', 'T')) : null;
  const desdeLabel = desde && !Number.isNaN(desde.getTime()) ? `Cliente desde ${MESES[desde.getMonth()]} ${desde.getFullYear()}` : 'Cliente';

  return (
    <div className={styles.page}>
      <ClienteSidebar active="perfil" userName={datos.name || 'Cliente'} />

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}><span>Portal</span> <span style={{ color: 'var(--muted-2)' }}>/</span> <span className={styles.accent}>Mi perfil</span></div>
            <div className={styles.pageTitleH}>Mi perfil</div>
          </div>
          <HeaderLogoutButton />
        </header>

        <div className={styles.content}>
          <div className={styles.profHero}>
            <div className={styles.pfPhoto}>{getInitials(datos.name)}</div>
            <div className={styles.pfInfo}>
              <div className={styles.pfName}>{datos.name}</div>
              <div className={styles.pfMail}><MailIcon /> {datos.email}</div>
              <div className={styles.pfBadge}><CheckIcon /> {desdeLabel}</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardIcon}><UserIcon /></div>
              <div><div className={styles.cardTitle}>Datos personales</div><div className={styles.cardSub}>Tu información de contacto</div></div>
              {!editando && (
                <button className={styles.btnGhost} style={{ marginLeft: 'auto' }} onClick={() => setEditando(true)}><EditIcon /> Editar perfil</button>
              )}
            </div>
            <div className={styles.cardBody}>
              <div className={styles.grid2}>
                <div className={`${styles.field} ${styles.full}`}>
                  <label className={styles.fieldLabel}>Nombre completo</label>
                  <div className={`${styles.inpWrap} ${editando ? '' : styles.ro}`}>
                    <span className={styles.inpIcon}><UserIcon /></span>
                    <input className={styles.inp} readOnly={!editando} value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Correo electrónico</label>
                  <div className={`${styles.inpWrap} ${editando ? '' : styles.ro}`}>
                    <span className={styles.inpIcon}><MailIcon /></span>
                    <input className={styles.inp} type="email" readOnly={!editando} value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Teléfono / WhatsApp</label>
                  <div className={`${styles.inpWrap} ${editando ? '' : styles.ro}`}>
                    <span className={styles.inpIcon}><PhoneIcon /></span>
                    <input className={styles.inp} readOnly={!editando} value={form.phone} onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>
            {editando && (
              <div className={styles.secFoot}>
                <button className={styles.btnGhost} onClick={cancelarEdicion} disabled={guardandoPerfil}>Cancelar</button>
                <button className={styles.btnPrimary} onClick={guardarPerfil} disabled={guardandoPerfil}><CheckIcon /> {guardandoPerfil ? 'Guardando...' : 'Guardar cambios'}</button>
              </div>
            )}
          </div>

          <form className={styles.card} onSubmit={handleSubmit(onSubmitPassword)}>
            <div className={styles.cardHead}>
              <div className={`${styles.cardIcon} ${styles.amber}`}><LockIcon /></div>
              <div><div className={styles.cardTitle}>Cambiar contraseña</div><div className={styles.cardSub}>Actualiza tu contraseña de acceso</div></div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Nueva contraseña <span className={styles.req}>*</span></label>
                  <div className={styles.inpWrap}>
                    <span className={styles.inpIcon}><LockIcon /></span>
                    <input className={styles.inp} type={showPw ? 'text' : 'password'} placeholder="••••••••" {...register('password')} />
                    <button type="button" className={styles.inpToggle} onClick={() => setShowPw((v) => !v)}><EyeIcon /></button>
                  </div>
                  {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Confirmar nueva contraseña <span className={styles.req}>*</span></label>
                  <div className={styles.inpWrap}>
                    <span className={styles.inpIcon}><LockIcon /></span>
                    <input className={styles.inp} type={showPw2 ? 'text' : 'password'} placeholder="••••••••" {...register('confirmPassword')} />
                    <button type="button" className={styles.inpToggle} onClick={() => setShowPw2((v) => !v)}><EyeIcon /></button>
                  </div>
                  {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword.message}</span>}
                </div>
              </div>
            </div>
            <div className={styles.secFoot}>
              <button type="button" className={styles.btnGhost} onClick={() => reset()} disabled={isSubmitting}>Cancelar</button>
              <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}><CheckIcon /> {isSubmitting ? 'Guardando...' : 'Guardar cambios'}</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
