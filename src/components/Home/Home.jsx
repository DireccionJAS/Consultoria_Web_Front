import React, { useEffect, useState } from 'react';
import logo from '../../img/logo_letras_negras.png';
import { Login } from './../../api/api.js';
import styles from './../../styles/Home.module.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M7 7h10v10" /></svg>
  );
}
function BackIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
  );
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6" /></svg>
  );
}
function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
  );
}
function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
  );
}
function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
  );
}
function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  );
}
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M6 18L18 6" /></svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" /><path d="M9 12l2 2 4-4" /></svg>
  );
}
function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
  );
}
function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4" /><path d="M3 21v-1a7 7 0 0 1 14 0v1" /></svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const variant = searchParams.get('panel') === 'admin' ? 'admin' : 'client';

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    localStorage.removeItem('token');
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const response = await Login(email, password);
      const data = response.response;

      if (!data.token) {
        setErrorMsg(response.message || 'Verifica tu correo o contraseña e intenta de nuevo.');
        setSubmitting(false);
        return;
      }

      localStorage.setItem('token', data.token);
      const decoded = jwtDecode(data.token);

      if (decoded.role === 'ADMIN') {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Bienvenido ',
          showConfirmButton: true,
        });
        navigate('/HomeAdmin');
      } else if (decoded.role === 'USER') {
        const selectedServiceData = sessionStorage.getItem('selectedService');

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Bienvenido ',
          showConfirmButton: true,
        }).then(() => {
          if (selectedServiceData) {
            navigate('/ClienteServicios');
          } else {
            navigate('/ClienteHome');
          }
        });
      } else {
        console.warn('Rol no reconocido:', decoded.role);
      }
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || 'Ocurrió un error al iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => navigate('/olvidar-contra');
  const volver = () => navigate('/');
  const singint = () => navigate('/Signin');

  return (
    <div className={styles.loginPage}>
      {/* LEFT BRAND PANEL */}
      <section className={styles.brandPanel}>
        <div className={styles.brandBg}></div>
        <div className={styles.brandGrid}></div>

        <div className={styles.brandTop}>
          {variant === 'client' ? (
            <button type="button" onClick={volver} className={styles.backBtn}>
              <BackIcon />
              Volver al sitio
            </button>
          ) : <span />}
          <div className={styles.brandMark}>
            <img src={logo} alt="JAS" />
            <div>
              <div className={styles.brandMarkText}>Consultoría <em>JAS</em></div>
              <div className={styles.brandMarkTag}>{variant === 'admin' ? 'Panel Admin' : 'Acceso seguro'}</div>
            </div>
          </div>
          {variant === 'admin' && (
            <div className={styles.brandStatus}>
              <span className={styles.dot}></span>
              Sistema en línea
            </div>
          )}
        </div>

        <div className={styles.brandHero}>
          <div className={styles.brandEyebrow}>— {variant === 'admin' ? 'Bienvenido' : 'Inicia sesión'}</div>
          {variant === 'admin' ? (
            <h1 className={styles.brandTitle}>
              Tu centro de<br />
              <em>control</em> migratorio.
            </h1>
          ) : (
            <h1 className={styles.brandTitle}>
              Tu próximo<br />
              <em>destino</em> empieza<br />
              aquí.
            </h1>
          )}
          <p className={styles.brandSub}>
            {variant === 'admin'
              ? 'Gestiona trámites, clientes, pagos y la página pública de Consultoría JAS desde un solo lugar.'
              : 'Una sola cuenta para acceder a tu portal personal de trámites o al panel administrativo. El sistema te lleva al lugar correcto.'}
          </p>
        </div>

        {variant === 'client' ? (
          <div className={styles.roleHint}>
            <div className={styles.roleHintHead}>
              <div className={styles.roleHintIcon}><ShieldIcon /></div>
              <div className={styles.roleHintTitle}>Detección automática de rol</div>
            </div>
            <p className={styles.roleHintDesc}>
              No necesitas elegir tu tipo de cuenta — el sistema te redirige según tu perfil después de validar tus credenciales.
            </p>
            <div className={styles.roleChips}>
              <div className={`${styles.roleChip} ${styles.admin}`}>
                <div className={styles.roleChipIcon}><GridIcon /></div>
                <div className={styles.roleChipText}>
                  <div className={styles.roleChipName}>Administrador</div>
                  <div className={styles.roleChipSub}>→ Panel admin</div>
                </div>
              </div>
              <div className={`${styles.roleChip} ${styles.client}`}>
                <div className={styles.roleChipIcon}><UserIcon /></div>
                <div className={styles.roleChipText}>
                  <div className={styles.roleChipName}>Cliente</div>
                  <div className={styles.roleChipSub}>→ Portal de trámites</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.brandFoot}>
            <div className={styles.brandStats}>
              <div className={styles.brandStat}><div className={styles.v}>87</div><div className={styles.l}>Trámites activos</div></div>
              <div className={styles.brandStat}><div className={styles.v}>96<em>%</em></div><div className={styles.l}>Aprobación</div></div>
              <div className={styles.brandStat}><div className={styles.v}>214</div><div className={styles.l}>Clientes</div></div>
            </div>
            <div>© 2026 · Jiutepec, Morelos</div>
          </div>
        )}
      </section>

      {/* RIGHT FORM PANEL */}
      <section className={styles.formPanel}>
        <div className={styles.formTop}>
          <span>¿Aún no tienes cuenta?</span>
          <button type="button" onClick={singint} className={styles.signupBtn}>
            Crear cuenta
            <ArrowIcon />
          </button>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formEyebrow}>Iniciar sesión</div>
          <h2 className={styles.formTitle}>Bienvenido<br />de <em>vuelta.</em></h2>
          <p className={styles.formSub}>
            Accede a tu portal con tu correo y contraseña. Si es tu primera vez, créate una cuenta gratis.
          </p>

          {errorMsg && (
            <div className={styles.errorBanner}>
              <div className={styles.errorIcon}><AlertIcon /></div>
              <div className={styles.errorText}>
                <div className={styles.errorTitle}>Credenciales incorrectas</div>
                <div className={styles.errorDesc}>{errorMsg}</div>
              </div>
              <button type="button" className={styles.errorClose} aria-label="Cerrar" onClick={() => setErrorMsg('')}>
                <CloseIcon />
              </button>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Correo electrónico <span className={styles.req}>*</span></label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><MailIcon /></span>
                <input
                  className={styles.fieldInput}
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Contraseña <span className={styles.req}>*</span></label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><LockIcon /></span>
                <input
                  className={styles.fieldInput}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className={styles.inputToggle} onClick={() => setShowPassword((s) => !s)}>
                  <EyeIcon />
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            <div className={styles.rowBetween}>
              <label className={`${styles.checkRow} ${remember ? styles.on : ''}`} onClick={() => setRemember((r) => !r)}>
                <span className={styles.checkBox}>{remember && <CheckIcon />}</span>
                Recordarme
              </label>
              <button type="button" onClick={handleForgotPassword} className={styles.forgot}>
                ¿Olvidaste tu contraseña?
                <ArrowIcon />
              </button>
            </div>

            <button type="submit" className={styles.btnLogin} disabled={submitting}>
              {submitting ? 'Ingresando…' : 'Iniciar sesión'}
              <div className={styles.arrowRev}><ArrowIcon /></div>
            </button>
          </form>

          <div className={styles.orDivider}>o</div>

          <div className={styles.signupCta}>
            ¿Es tu primera vez en JAS? <a href="#" onClick={(e) => { e.preventDefault(); singint(); }}>Crea tu cuenta gratis →</a>
          </div>

          <div className={styles.formFoot}>
            <span className={styles.copy}>© 2026 · Consultoría JAS</span>
            <div className={styles.links}>
              <a href="#">Privacidad</a>
              <a href="#">Términos</a>
              <a href="#">Ayuda</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
