import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import {
  clientes,
  servicios,
  RegistrarTransaccion as registrarTransaccionAPI,
  envioCorreo,
} from '../../api/api.js';
import styles from '../../styles/tramites/CrearTramiteModal.module.css';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6FAEDB,#4E6A9C)',
  'linear-gradient(135deg,#e89a7c,#c25a2e)',
  'linear-gradient(135deg,#7ec286,#2c7a3f)',
  'linear-gradient(135deg,#c893e0,#7b3fa0)',
];

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function avatarGradient(idUser) {
  const idx = Number(idUser) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[Math.max(idx, 0)];
}

function formatMoney(n) {
  return `$${(n || 0).toLocaleString('en-US')} MXN`;
}

function parseMoneyInput(value) {
  const digits = value.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

const ServiceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="4" width="20" height="28" rx="2" />
    <circle cx="16" cy="14" r="3.5" />
    <path d="M10 22h12M10 26h8" />
  </svg>
);

export default function CrearTramiteModal({ show, onHide, scope = 'empresa', onCreated }) {
  const [usuarios, setUsuarios] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const [openCliente, setOpenCliente] = useState(false);
  const [openServicio, setOpenServicio] = useState(false);
  const [buscarCliente, setBuscarCliente] = useState('');
  const [buscarServicio, setBuscarServicio] = useState('');

  // Sin backend de Empresas todavía (no existe esa entidad) - selector
  // decorativo por ahora, opción fija única, no se envía al guardar el trámite.
  const [empresa, setEmpresa] = useState('');
  const [openEmpresa, setOpenEmpresa] = useState(false);

  const [pagoInicial, setPagoInicial] = useState(0);
  const [costoTotal, setCostoTotal] = useState(0);

  const [errors, setErrors] = useState({});

  const clienteRef = useRef(null);
  const servicioRef = useRef(null);
  const empresaRef = useRef(null);

  useEffect(() => {
    if (!show) return;

    const fetchClientes = async () => {
      try {
        const response = await clientes();
        if (response.success && Array.isArray(response.response.users)) {
          setUsuarios(response.response.users);
        } else {
          setUsuarios([]);
        }
      } catch (error) {
        console.error('Error al obtener los clientes:', error);
        setUsuarios([]);
      }
    };

    const fetchServicios = async () => {
      try {
        const response = await servicios();
        if (response.success && Array.isArray(response.response.Transacts)) {
          setTransacciones(response.response.Transacts);
        } else {
          setTransacciones([]);
        }
      } catch (error) {
        console.error('Error al obtener los servicios:', error);
        setTransacciones([]);
      }
    };

    setLoadingData(true);
    Promise.all([fetchClientes(), fetchServicios()]).finally(() => setLoadingData(false));
  }, [show]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (clienteRef.current && !clienteRef.current.contains(e.target)) setOpenCliente(false);
      if (servicioRef.current && !servicioRef.current.contains(e.target)) setOpenServicio(false);
      if (empresaRef.current && !empresaRef.current.contains(e.target)) setOpenEmpresa(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!show) return null;

  const resetForm = () => {
    setSelectedUser(null);
    setSelectedService(null);
    setPagoInicial(0);
    setCostoTotal(0);
    setBuscarCliente('');
    setBuscarServicio('');
    setOpenCliente(false);
    setOpenServicio(false);
    setEmpresa('');
    setOpenEmpresa(false);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const saldoRestante = Math.max(costoTotal - pagoInicial, 0);

  const filteredUsuarios = usuarios.filter((u) => {
    const term = buscarCliente.trim().toLowerCase();
    if (!term) return true;
    return u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term);
  });

  const filteredServicios = transacciones.filter((t) => {
    const term = buscarServicio.trim().toLowerCase();
    if (!term) return true;
    return t.name?.toLowerCase().includes(term);
  });

  const pickCliente = (user) => {
    setSelectedUser(user);
    setOpenCliente(false);
    setBuscarCliente('');
    setErrors((prev) => ({ ...prev, idUser: undefined }));
  };

  const pickServicio = (transact) => {
    setSelectedService(transact);
    setOpenServicio(false);
    setBuscarServicio('');
    setErrors((prev) => ({ ...prev, idTransact: undefined }));
    if (transact.cost) setCostoTotal(transact.cost);
  };

  const validate = () => {
    const next = {};
    if (!selectedUser) next.idUser = 'Selecciona un cliente';
    if (!selectedService) next.idTransact = 'Selecciona un servicio';
    if (!pagoInicial || pagoInicial <= 0) next.paid = 'Ingresa un pago inicial válido';
    if (!costoTotal || costoTotal <= 0) next.paidAll = 'Ingresa un costo total válido';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await registrarTransaccionAPI({
        idUser: selectedUser.idUser,
        idTransact: selectedService.idTransact,
        paid: pagoInicial,
        paidAll: costoTotal,
        status: 1,
        stepProgress: 6,
        advance: false,
      });

      await envioCorreo(selectedUser.email, selectedUser.name, selectedService.description);

      Swal.fire({
        icon: 'success',
        title: 'Trámite registrado y correo enviado',
        confirmButtonText: 'Aceptar',
      });

      resetForm();
      onHide();
      if (typeof onCreated === 'function') onCreated();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error durante el registro o envío del correo.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} data-scope={scope} onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <div className={styles.modalHeadRow}>
            <div className={styles.modalHeadIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div>
              <div className={styles.modalEyebrow}>Nuevo registro</div>
              <div className={styles.modalTitle}>Crear trámite</div>
            </div>
          </div>
          <button className={styles.modalClose} onClick={handleClose} aria-label="Cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Cliente */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              Cliente <span className={styles.req}>*</span>
              <span className={styles.fieldHint}>solo tus clientes asignados</span>
            </label>
            <div
              ref={clienteRef}
              className={`${styles.selWrap} ${openCliente ? styles.open : ''} ${errors.idUser ? styles.invalid : ''}`}
            >
              <button type="button" className={styles.selTrigger} onClick={() => setOpenCliente((v) => !v)}>
                {selectedUser ? (
                  <>
                    <span className={styles.selAvatar} style={{ background: avatarGradient(selectedUser.idUser) }}>
                      {getInitials(selectedUser.name)}
                    </span>
                    <span className={styles.selMain}>
                      <span className={styles.selName}>{selectedUser.name}</span>
                      <span className={styles.selSub}>
                        {selectedUser.email}{selectedUser.phone ? ` · ${selectedUser.phone}` : ''}
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className={`${styles.selAvatar} ${styles.empty}`}>?</span>
                    <span className={styles.selMain}>
                      <span className={styles.selPlaceholder}>Selecciona un cliente</span>
                    </span>
                  </>
                )}
                <svg className={styles.selChev} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {openCliente && (
                <div className={styles.selMenu}>
                  <div className={styles.selSearch}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}>
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Buscar cliente por nombre o correo..."
                      value={buscarCliente}
                      onChange={(e) => setBuscarCliente(e.target.value)}
                    />
                  </div>
                  <div className={styles.selList}>
                    {loadingData && <div className={styles.loadingRow}><span className={styles.spinner} />Cargando clientes...</div>}
                    {!loadingData && filteredUsuarios.length === 0 && (
                      <div className={styles.selEmpty}>No se encontraron clientes</div>
                    )}
                    {!loadingData && filteredUsuarios.map((u) => (
                      <div
                        key={u.idUser}
                        className={`${styles.selOpt} ${selectedUser?.idUser === u.idUser ? styles.active : ''}`}
                        onClick={() => pickCliente(u)}
                      >
                        <span className={styles.selAvatar} style={{ background: avatarGradient(u.idUser) }}>
                          {getInitials(u.name)}
                        </span>
                        <span className={styles.selMain}>
                          <span className={styles.selName}>{u.name}</span>
                          <span className={styles.selSub}>{u.email}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {errors.idUser && <div className={styles.fieldMsg}>{errors.idUser}</div>}
          </div>

          {/* Empresa */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Empresa</label>
            <div ref={empresaRef} className={`${styles.selWrap} ${openEmpresa ? styles.open : ''}`}>
              <button type="button" className={styles.selTrigger} onClick={() => setOpenEmpresa((v) => !v)}>
                <span className={styles.selMain}>
                  {empresa ? (
                    <span className={styles.selName}>{empresa}</span>
                  ) : (
                    <span className={styles.selPlaceholder}>Selecciona una empresa</span>
                  )}
                </span>
                <svg className={styles.selChev} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {openEmpresa && (
                <div className={styles.selMenu}>
                  <div className={styles.selList}>
                    <div className={styles.selOpt} onClick={() => { setEmpresa('Consultoría JAS'); setOpenEmpresa(false); }}>
                      <span className={styles.selName}>Consultoría JAS</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Servicio */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Servicio <span className={styles.req}>*</span></label>
            <div
              ref={servicioRef}
              className={`${styles.selWrap} ${openServicio ? styles.open : ''} ${errors.idTransact ? styles.invalid : ''}`}
            >
              <button type="button" className={styles.selTrigger} onClick={() => setOpenServicio((v) => !v)}>
                {selectedService ? (
                  <>
                    <span className={styles.selIconBox}><ServiceIcon /></span>
                    <span className={styles.selMain}>
                      <span className={styles.selName}>{selectedService.name}</span>
                      <span className={styles.selSub}>{formatMoney(selectedService.cost)}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className={styles.selIconBox}><ServiceIcon /></span>
                    <span className={styles.selMain}>
                      <span className={styles.selPlaceholder}>Selecciona un servicio</span>
                    </span>
                  </>
                )}
                <svg className={styles.selChev} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {openServicio && (
                <div className={styles.selMenu}>
                  <div className={styles.selSearch}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}>
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Buscar servicio..."
                      value={buscarServicio}
                      onChange={(e) => setBuscarServicio(e.target.value)}
                    />
                  </div>
                  <div className={styles.selList}>
                    {loadingData && <div className={styles.loadingRow}><span className={styles.spinner} />Cargando servicios...</div>}
                    {!loadingData && filteredServicios.length === 0 && (
                      <div className={styles.selEmpty}>No se encontraron servicios</div>
                    )}
                    {!loadingData && filteredServicios.map((t) => (
                      <div
                        key={t.idTransact}
                        className={`${styles.selOpt} ${selectedService?.idTransact === t.idTransact ? styles.active : ''}`}
                        onClick={() => pickServicio(t)}
                      >
                        <span className={styles.selIconBox}><ServiceIcon /></span>
                        <span className={styles.selMain}>
                          <span className={styles.selName}>{t.name}</span>
                          <span className={styles.selSub}>{formatMoney(t.cost)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {errors.idTransact && <div className={styles.fieldMsg}>{errors.idTransact}</div>}
          </div>

          {/* Montos */}
          <div className={styles.amountGrid}>
            <div className={styles.field} style={{ marginBottom: 0 }}>
              <label className={styles.fieldLabel}>Pago inicial <span className={styles.req}>*</span></label>
              <div className={`${styles.moneyWrap} ${errors.paid ? styles.error : ''}`}>
                <span className={styles.moneyPrefix}>$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pagoInicial ? pagoInicial.toLocaleString('en-US') : ''}
                  onChange={(e) => {
                    setPagoInicial(parseMoneyInput(e.target.value));
                    setErrors((prev) => ({ ...prev, paid: undefined }));
                  }}
                />
                <span className={styles.moneySuffix}>MXN</span>
              </div>
              {errors.paid && <div className={styles.fieldMsg}>{errors.paid}</div>}
            </div>
            <div className={styles.field} style={{ marginBottom: 0 }}>
              <label className={styles.fieldLabel}>Costo total <span className={styles.req}>*</span></label>
              <div className={`${styles.moneyWrap} ${errors.paidAll ? styles.error : ''}`}>
                <span className={styles.moneyPrefix}>$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={costoTotal ? costoTotal.toLocaleString('en-US') : ''}
                  onChange={(e) => {
                    setCostoTotal(parseMoneyInput(e.target.value));
                    setErrors((prev) => ({ ...prev, paidAll: undefined }));
                  }}
                />
                <span className={styles.moneySuffix}>MXN</span>
              </div>
              {errors.paidAll && <div className={styles.fieldMsg}>{errors.paidAll}</div>}
            </div>
          </div>

          {/* Resumen en vivo */}
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span className={styles.lbl}>Pago inicial</span>
              <span className={styles.val}>{formatMoney(pagoInicial)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.lbl}>Saldo restante</span>
              <span className={styles.val}>{formatMoney(saldoRestante)}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span className={styles.lbl}>Costo total del trámite</span>
              <span className={styles.val}>{formatMoney(costoTotal)}</span>
            </div>
          </div>

          {/* Aviso de correo */}
          <div className={styles.emailNotice}>
            <div className={styles.emailNoticeIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6" />
              </svg>
            </div>
            <div className={styles.emailNoticeText}>
              Al guardar, se enviará automáticamente un correo a{' '}
              <strong>{selectedUser ? selectedUser.name : 'el cliente seleccionado'}</strong> con sus credenciales de acceso al portal.
            </div>
          </div>
        </div>

        <div className={styles.modalFoot}>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={handleClose} disabled={submitting}>
            Cancelar
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar y notificar'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
