import React, { useEffect, useState } from 'react';
import logo from '../../img/logo_letras_negras.png';
import { Login, loginWithGoogle, completeGoogleSignup } from './../../api/api.js';
import styles from './../../styles/Home.module.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleAuthModal from './GoogleAuthModal.jsx';

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
function GoogleGIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"></path>
      <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"></path>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"></path>
    </svg>
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

  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleStep, setGoogleStep] = useState('choice');
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [googlePending, setGooglePending] = useState(null); // { accessToken, email, name }
  const [googlePhone, setGooglePhone] = useState('');

  const completeSession = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);

    if (decoded.role === 'ADMIN') {
      navigate('/HomeAdmin');
    } else if (decoded.role === 'EMPRESA') {
      navigate('/HomeEmpresa');
    } else if (decoded.role === 'USER') {
      const selectedServiceData = sessionStorage.getItem('selectedService');
      navigate(selectedServiceData ? '/ClienteServicios' : '/ClienteHome');
    } else {
      console.warn('Rol no reconocido:', decoded.role);
    }
  };

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

      completeSession(data.token);
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || 'Ocurrió un error al iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => navigate('/olvidar-contra');
  const volver = () => navigate('/');
  const singint = () => navigate('/Signin');

  const runGoogleLogin = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: async (tokenResponse) => {
      setErrorMsg('');
      setGoogleSubmitting(true);
      try {
        const response = await loginWithGoogle(tokenResponse.access_token);
        const data = response.response;

        if (data?.needsPhone) {
          setGooglePending({ accessToken: tokenResponse.access_token, email: data.email, name: data.name });
          setGooglePhone('');
          setGoogleStep('phone');
          setGoogleModalOpen(true);
          return;
        }
        if (!data?.token) {
          setErrorMsg(response.message || 'No se pudo iniciar sesión con Google.');
          return;
        }
        setGoogleModalOpen(false);
        completeSession(data.token);
      } catch {
        setErrorMsg('Ocurrió un error al iniciar sesión con Google.');
      } finally {
        setGoogleSubmitting(false);
      }
    },
    onError: () => setErrorMsg('No se pudo conectar con tu cuenta de Google.'),
  });

  const handleOpenGoogleModal = () => { setGoogleStep('choice'); setGoogleModalOpen(true); };
  const handleGoogleModalClose = () => setGoogleModalOpen(false);
  const handleGoogleChooseNo = () => setGoogleStep('alts');
  const handleGoogleBack = () => setGoogleStep('choice');

  const handleSubmitGooglePhone = async () => {
    if (!googlePending || googlePhone.length !== 10) return;
    setGoogleSubmitting(true);
    try {
      const response = await completeGoogleSignup(googlePending.accessToken, googlePhone);
      const data = response.response;
      if (!data?.token) {
        setErrorMsg(response.message || 'No se pudo completar tu registro con Google.');
        return;
      }
      setGoogleModalOpen(false);
      setGooglePending(null);
      completeSession(data.token);
    } catch {
      setErrorMsg('Ocurrió un error al completar tu registro con Google.');
    } finally {
      setGoogleSubmitting(false);
    }
  };

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

        <div className={styles.brandFoot}>
          <div className={styles.brandStats}>
            <div className={styles.brandStat}><div className={styles.v}>87</div><div className={styles.l}>Trámites activos</div></div>
            <div className={styles.brandStat}><div className={styles.v}>96<em>%</em></div><div className={styles.l}>Aprobación</div></div>
            <div className={styles.brandStat}><div className={styles.v}>214</div><div className={styles.l}>Clientes</div></div>
          </div>
          <div>© 2026 · Jiutepec, Morelos</div>
        </div>
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

          <button type="button" className={styles.gsign} onClick={handleOpenGoogleModal} disabled={googleSubmitting}>
            <GoogleGIcon />
            {googleSubmitting ? 'Conectando…' : 'Iniciar sesión con Google'}
          </button>
          <button type="button" className={styles.nolink} onClick={handleOpenGoogleModal}>¿No tienes cuenta de Google?</button>

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

      <GoogleAuthModal
        show={googleModalOpen}
        step={googleStep}
        onClose={handleGoogleModalClose}
        onChooseYes={() => runGoogleLogin()}
        onChooseNo={handleGoogleChooseNo}
        onBack={handleGoogleBack}
        submitting={googleSubmitting}
        pendingName={googlePending?.name}
        pendingEmail={googlePending?.email}
        phone={googlePhone}
        onPhoneChange={setGooglePhone}
        onSubmitPhone={handleSubmitGooglePhone}
      />
    </div>
  );
}
