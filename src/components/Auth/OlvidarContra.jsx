import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { olvidarContra, actualizarContra, obtenerUsuarioPorCorreo } from './../../api/api.js';
import styles from './../../styles/OlvidarContra.module.css';
import logo from './../../img/logo_letras_negras.png';

function BackIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>; }
function ArrowIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M7 7h10v10" /></svg>; }
function MailIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6" /></svg>; }
function LockIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>; }
function LockBigIcon() { return <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /><circle cx="12" cy="16" r="1.5" /></svg>; }
function EyeIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>; }
function CheckIcon({ size = 12 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>; }
function AlertIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>; }
function ClockIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>; }
function InfoIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>; }

const TIEMPO_ESPERA = 5 * 60;

export default function OlvidarContra() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmPassword, setVerConfirmPassword] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [puedeReenviar, setPuedeReenviar] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const otpRefs = useRef([]);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    localStorage.removeItem('token');
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

  const iniciarTemporizador = () => {
    setTiempoRestante(TIEMPO_ESPERA);
    setPuedeReenviar(false);
    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPuedeReenviar(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const solicitarCodigo = async (correo) => {
    const resUser = await obtenerUsuarioPorCorreo(correo);
    const user = resUser?.response?.user;
    if (!user?.idUser) throw new Error('Usuario no encontrado.');
    setUserId(user.idUser);

    const res = await olvidarContra(correo);
    const code = res?.response?.code;
    if (!code) throw new Error('No se recibió el código del backend.');
    setCodigo(code);
    return code;
  };

  const handleEnviarCodigo = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      Swal.fire('Error', 'Por favor ingresa un correo válido.', 'error');
      return;
    }
    setEnviando(true);
    try {
      await solicitarCodigo(email.trim());
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError(false);
      setPaso(2);
      iniciarTemporizador();
      Swal.fire('¡Correo enviado!', 'Revisa tu bandeja para ver el código.', 'success');
    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      Swal.fire('Error', 'El correo no existe en el sistema', 'error');
    } finally {
      setEnviando(false);
    }
  };

  const handleReenviar = async () => {
    try {
      await solicitarCodigo(email.trim());
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError(false);
      iniciarTemporizador();
      Swal.fire('¡Código reenviado!', 'Revisa tu bandeja de nuevo.', 'success');
    } catch (error) {
      console.error('Error al reenviar código:', error);
      Swal.fire('Error', 'No se pudo reenviar el código.', 'error');
    }
  };

  const handleVerificarCodigo = (e) => {
    e.preventDefault();
    const codigoIngresado = otpDigits.join('');
    if (codigoIngresado.length < 6 || codigoIngresado.trim() !== String(codigo).trim()) {
      setOtpError(true);
      Swal.fire('Error', 'El código ingresado es incorrecto.', 'error');
      return;
    }
    setOtpError(false);
    setPaso(3);
  };

  const handleActualizarPassword = async (e) => {
    e.preventDefault();
    if (!nuevaPassword || nuevaPassword.length < 6) {
      Swal.fire('Advertencia', 'La contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }
    try {
      const res = await actualizarContra(userId, nuevaPassword);
      if (!res?.success) {
        // El backend responde 200 con success:false (no un error HTTP) para
        // casos como "la contraseña no puede ser igual a la anterior" — sin
        // este check el flujo seguía a la pantalla de éxito sin haber
        // cambiado nada.
        throw new Error(res?.message || 'No se pudo actualizar la contraseña.');
      }
      setPaso(4);
    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error al actualizar la contraseña, por favor contacta a soporte.',
      });
    }
  };

  const handleOtpChange = (index, rawValue) => {
    const val = rawValue.replace(/\D/g, '').slice(-1);
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    setOtpError(false);
    if (val && otpRefs.current[index + 1]) otpRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1].focus();
    }
  };

  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const passwordsMatch = nuevaPassword && confirmarPassword && nuevaPassword === confirmarPassword;
  const pwScore = Math.min(4, Math.floor(nuevaPassword.length / 3) + (/[^a-zA-Z0-9]/.test(nuevaPassword) ? 1 : 0) + (/\d/.test(nuevaPassword) ? 1 : 0));

  const steps = [
    { n: 1, title: 'Ingresa tu correo' },
    { n: 2, title: 'Verifica el código' },
    { n: 3, title: 'Nueva contraseña' },
    { n: 4, title: '¡Listo!' },
  ];

  const progressLabel = [
    'Paso 1 de 4 · Ingresa tu correo',
    'Paso 2 de 4 · Verifica el código',
    'Paso 3 de 4 · Nueva contraseña',
    'Paso 4 de 4 · ¡Contraseña actualizada!',
  ][paso - 1];

  return (
    <div className={styles.recoveryPage}>
      {/* LEFT BRAND PANEL */}
      <section className={styles.brandPanel}>
        <div className={styles.brandBg}></div>
        <div className={styles.brandGrid}></div>

        <div className={styles.brandTop}>
          <button type="button" onClick={() => navigate('/Login')} className={styles.backBtn}>
            <BackIcon />
            Volver al login
          </button>
          <div className={styles.brandMark}>
            <img src={logo} alt="JAS" />
            <div>
              <div className={styles.brandMarkText}>Consultoría <em>JAS</em></div>
              <div className={styles.brandMarkTag}>Recuperación</div>
            </div>
          </div>
        </div>

        <div className={styles.brandHero}>
          <div className={styles.brandIconLg}><LockBigIcon /></div>
          <div className={styles.brandEyebrow}>— Recupera tu acceso</div>
          <h1 className={styles.brandTitle}>Restablece tu<br /><em>contraseña.</em></h1>
          <p className={styles.brandSub}>
            Te ayudamos a recuperar el acceso a tu cuenta en unos cuantos pasos. Verifica tu correo y crea una nueva contraseña segura.
          </p>
        </div>

        <div className={styles.brandSteps}>
          {steps.map((s) => (
            <div key={s.n} className={`${styles.bstep} ${paso === s.n ? styles.active : ''} ${paso > s.n ? styles.done : ''}`}>
              <div className={styles.bstepNum}>{paso > s.n ? <CheckIcon /> : s.n}</div>
              <div className={styles.bstepTitle}>{s.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* RIGHT FORM PANEL */}
      <section className={styles.formPanel}>
        <div className={styles.formTop}>
          <span>¿Recordaste tu contraseña?</span>
          <a href="/Login" className={styles.loginLink}>Iniciar sesión →</a>
        </div>

        <div className={styles.formCard}>
          <div className={styles.progressHead}>
            <div className={styles.progressTrack}>
              <div className={`${styles.ptrackDot} ${paso === 1 ? styles.active : ''} ${paso > 1 ? styles.done : ''}`}></div>
              <div className={styles.ptrackBar}><div className={styles.fill} style={{ width: paso >= 2 ? '100%' : '0' }}></div></div>
              <div className={`${styles.ptrackDot} ${paso === 2 ? styles.active : ''} ${paso > 2 ? styles.done : ''}`}></div>
              <div className={styles.ptrackBar}><div className={styles.fill} style={{ width: paso >= 3 ? '100%' : '0' }}></div></div>
              <div className={`${styles.ptrackDot} ${paso === 3 ? styles.active : ''} ${paso > 3 ? styles.done : ''}`}></div>
              <div className={styles.ptrackBar}><div className={styles.fill} style={{ width: paso >= 4 ? '100%' : '0' }}></div></div>
              <div className={`${styles.ptrackDot} ${paso === 4 ? styles.active : ''}`}></div>
            </div>
            <div className={styles.progressLabel}>{progressLabel}</div>
          </div>

          {/* PASO 1: CORREO */}
          {paso === 1 && (
            <form className={styles.stepPane} onSubmit={handleEnviarCodigo}>
              <h2 className={styles.formTitle}>¿Cuál es tu <em>correo?</em></h2>
              <p className={styles.formSub}>Ingresa el correo asociado a tu cuenta. Te enviaremos un código de verificación.</p>

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

              <div className={styles.btnRow}>
                <a href="/Login" className={`${styles.btn} ${styles.btnGhost}`}>
                  <BackIcon />
                  Volver al login
                </a>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={enviando}>
                  {enviando ? 'Enviando…' : 'Enviar código'}
                  <div className={styles.arrowRev}><ArrowIcon /></div>
                </button>
              </div>
            </form>
          )}

          {/* PASO 2: VERIFICAR CÓDIGO */}
          {paso === 2 && (
            <form className={styles.stepPane} onSubmit={handleVerificarCodigo}>
              <h2 className={styles.formTitle}>Verifica el <em>código.</em></h2>
              <p className={styles.formSub}>Ingresa el código de 6 dígitos que enviamos a tu correo.</p>

              <div className={styles.otpInfo}>
                <div className={styles.otpInfoIcon}><MailIcon /></div>
                <div>
                  <div className={styles.otpInfoTitle}>Código enviado a:</div>
                  <div className={styles.otpInfoMail}>{email}</div>
                </div>
              </div>

              <label className={styles.fieldLabel}>Código de verificación <span className={styles.req}>*</span></label>
              <div className={styles.otpInputs}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    className={`${styles.otpBox} ${digit ? styles.filled : ''} ${otpError ? styles.error : ''}`}
                    maxLength={1}
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <div className={styles.otpTimer}>
                <div className={styles.otpTimerLeft}>
                  <div className={styles.otpTimerClock}><ClockIcon /></div>
                  <span>{tiempoRestante > 0 ? 'Expira en' : 'El código expiró'}</span>
                  {tiempoRestante > 0 && <span className={styles.otpTimerCount}>{formatTimer(tiempoRestante)}</span>}
                </div>
                <div className={styles.otpResend}>
                  ¿No llegó?{' '}
                  <button type="button" onClick={handleReenviar} disabled={!puedeReenviar}>
                    Reenviar
                  </button>
                </div>
              </div>

              <div className={styles.btnRow}>
                <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setPaso(1)}>
                  <BackIcon />
                  Volver
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Verificar código
                  <div className={styles.arrowRev}><ArrowIcon /></div>
                </button>
              </div>
            </form>
          )}

          {/* PASO 3: NUEVA CONTRASEÑA */}
          {paso === 3 && (
            <form className={styles.stepPane} onSubmit={handleActualizarPassword}>
              <h2 className={styles.formTitle}>Crea una<br /><em>nueva contraseña.</em></h2>
              <p className={styles.formSub}>Tu nueva contraseña debe ser distinta a la anterior y tener al menos 6 caracteres.</p>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Nueva contraseña <span className={styles.req}>*</span></label>
                <div className={`${styles.inputWrap} ${nuevaPassword.length >= 6 ? styles.valid : ''}`}>
                  <span className={styles.inputIcon}><LockIcon /></span>
                  <input
                    className={styles.fieldInput}
                    type={verPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    required
                  />
                  <button type="button" className={styles.inputToggle} onClick={() => setVerPassword((v) => !v)}><EyeIcon /></button>
                </div>
                {nuevaPassword && (
                  <>
                    <div className={styles.pwStrength}>
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={`${styles.pwBar} ${i < pwScore ? (pwScore >= 3 ? styles.on : styles.mid) : ''}`}></div>
                      ))}
                    </div>
                    <div className={styles.pwHint}>
                      Fortaleza: <strong style={{ color: pwScore >= 3 ? 'var(--green)' : '#C68714' }}>{pwScore >= 3 ? 'Buena' : 'Débil'}</strong> · usa mayúsculas, números y símbolos
                    </div>
                  </>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Confirmar nueva contraseña <span className={styles.req}>*</span></label>
                <div className={`${styles.inputWrap} ${confirmarPassword && !passwordsMatch ? styles.error : passwordsMatch ? styles.valid : ''}`}>
                  <span className={styles.inputIcon}><LockIcon /></span>
                  <input
                    className={styles.fieldInput}
                    type={verConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    required
                  />
                  <button type="button" className={styles.inputToggle} onClick={() => setVerConfirmPassword((v) => !v)}><EyeIcon /></button>
                </div>
                {confirmarPassword && !passwordsMatch && (
                  <div className={`${styles.fieldMsg} ${styles.error}`}><AlertIcon />Las contraseñas no coinciden</div>
                )}
                {passwordsMatch && (
                  <div className={`${styles.fieldMsg} ${styles.ok}`}><CheckIcon size={11} />Las contraseñas coinciden</div>
                )}
              </div>

              <div className={styles.infoNote}>
                <InfoIcon />
                <span>No puede ser igual a tu contraseña anterior.</span>
              </div>

              <div className={styles.btnRow}>
                <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setPaso(2)}>
                  <BackIcon />
                  Volver
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Guardar contraseña
                  <div className={styles.arrowRev}><ArrowIcon /></div>
                </button>
              </div>
            </form>
          )}

          {/* PASO 4: ÉXITO */}
          {paso === 4 && (
            <div className={styles.stepPane}>
              <div className={styles.successWrap}>
                <div className={styles.successIcon}><CheckIcon size={44} /></div>
                <h2 className={styles.successTitle}>Contraseña<br /><em>actualizada.</em></h2>
                <p className={styles.successSub}>Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>

                <div className={styles.btnRow} style={{ maxWidth: 300, margin: '0 auto' }}>
                  <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => navigate('/Login')}>
                    Iniciar sesión
                    <div className={styles.arrowRev}><ArrowIcon /></div>
                  </button>
                </div>
              </div>
            </div>
          )}

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
