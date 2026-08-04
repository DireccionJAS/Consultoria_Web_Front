import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { registrarPagoEfectivo, clientes, tramitesPorId } from './../../api/api.js';
import styles from './../../styles/PagoModals.module.css';

function IconCash() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
      <circle cx="12" cy="12" r="2.5"></circle>
      <path d="M6 12h.01M18 12h.01"></path>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M6 6l12 12M6 18L18 6"></path>
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="7" r="4"></circle>
      <path d="M3 21v-1a7 7 0 0 1 14 0v1"></path>
    </svg>
  );
}

function IconTramite() {
  return (
    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="4" width="20" height="28" rx="2"></rect>
      <circle cx="16" cy="14" r="3.5"></circle>
      <path d="M10 22h12M10 26h8"></path>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12l5 5L20 7"></path>
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <path d="M22 4L12 14.01l-3-3"></path>
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="M21 21l-4.35-4.35"></path>
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2"></rect>
      <path d="M16 2v4M8 2v4M3 10h18"></path>
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M6 9l6 6 6-6"></path>
    </svg>
  );
}

const hoy = () => new Date().toISOString().slice(0, 10);

export default function ModalConfirmarPagoEfectivo({ show, onHide, pago, onConfirmado }) {
  const requiereSeleccion = !pago;

  const [concepto, setConcepto] = useState('Adelanto');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(hoy());
  const [enviando, setEnviando] = useState(false);

  // Selector de cliente + trámite: solo se usa cuando el modal se abre sin un
  // pago de contexto (botón "Agregar pago" del topbar). No estaba en el
  // mockup estático, que asumía el cliente/trámite ya conocidos.
  const [listaClientes, setListaClientes] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [tramitesCliente, setTramitesCliente] = useState([]);
  const [cargandoTramites, setCargandoTramites] = useState(false);
  const [idTramiteSeleccionado, setIdTramiteSeleccionado] = useState('');

  useEffect(() => {
    if (!show) return;
    setConcepto('Adelanto');
    setMonto('');
    setFecha(hoy());
    setClienteSeleccionado(null);
    setBusquedaCliente('');
    setBuscadorAbierto(false);
    setTramitesCliente([]);
    setIdTramiteSeleccionado('');
    if (requiereSeleccion) {
      clientes()
        .then((res) => setListaClientes(res.success ? res.response.users : []))
        .catch(() => setListaClientes([]));
    }
  }, [show, requiereSeleccion]);

  useEffect(() => {
    if (!clienteSeleccionado) return;
    setCargandoTramites(true);
    setIdTramiteSeleccionado('');
    tramitesPorId(clienteSeleccionado.idUser)
      .then((res) => setTramitesCliente(res.success ? res.response.transactProgresses : []))
      .catch(() => setTramitesCliente([]))
      .finally(() => setCargandoTramites(false));
  }, [clienteSeleccionado]);

  if (!show) return null;

  const idUser = pago ? pago.idUser : clienteSeleccionado?.idUser;
  const idTransact = pago ? pago.idTransact : (idTramiteSeleccionado ? Number(idTramiteSeleccionado) : null);
  const nombreCliente = pago ? pago.user?.name : clienteSeleccionado?.name;
  const nombreTramite = pago
    ? pago.transact?.name
    : tramitesCliente.find((t) => t.idTransact === Number(idTramiteSeleccionado))?.transact?.name;

  const clientesFiltrados = listaClientes.filter((c) =>
    (c.name ?? '').toLowerCase().includes(busquedaCliente.toLowerCase())
  );

  const montoNumero = parseFloat(monto);
  const puedeConfirmar = !enviando && !Number.isNaN(montoNumero) && montoNumero > 0 && !!idUser && !!idTransact;

  const handleConfirmar = async () => {
    if (!puedeConfirmar) return;
    setEnviando(true);
    try {
      const res = await registrarPagoEfectivo({ idUser, idTransact, total: montoNumero });
      // El backend siempre responde HTTP 201 aunque falle al guardar
      // (createPayment atrapa la excepción y devuelve success:false igual),
      // así que hay que revisar el body, no solo el status HTTP.
      if (!res?.success) {
        throw new Error(res?.message || 'No se pudo registrar el pago');
      }
      onConfirmado();
      onHide();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo registrar el pago',
        text: error?.message || 'Ocurrió un error al intentar registrar el pago.',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={`${styles.root} ${styles.overlay}`} onClick={onHide}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <div className={styles.mhRow}>
            <div className={styles.mhIcon}><IconCash /></div>
            <div>
              <div className={styles.mhEyebrow}>Registrar pago</div>
              <div className={styles.mhTitle}>Confirmar pago en efectivo</div>
            </div>
          </div>
          <button className={styles.mhClose} onClick={onHide}><IconClose /></button>
        </div>

        <div className={styles.modalBody}>
          {requiereSeleccion ? (
            <>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Cliente <span className={styles.req}>*</span></label>
                {clienteSeleccionado ? (
                  <div className={styles.roRow} style={{ marginBottom: 0 }}>
                    <div className={styles.roIcon}><IconUser /></div>
                    <div style={{ flex: 1 }}><div className={styles.roVal}>{clienteSeleccionado.name}</div></div>
                    <button
                      className={`${styles.btn} ${styles.btnGhost}`}
                      style={{ padding: '6px 10px', fontSize: 11 }}
                      onClick={() => setClienteSeleccionado(null)}
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <div className={styles.moneyWrap} style={{ height: 38 }}>
                      <span className={styles.moneyPrefix} style={{ padding: '0 4px 0 13px' }}><IconSearch /></span>
                      <input
                        type="text"
                        placeholder="Buscar cliente por nombre…"
                        value={busquedaCliente}
                        onChange={(e) => setBusquedaCliente(e.target.value)}
                        onFocus={() => setBuscadorAbierto(true)}
                        onBlur={() => setTimeout(() => setBuscadorAbierto(false), 150)}
                      />
                    </div>
                    {buscadorAbierto && (
                      <div
                        style={{
                          position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, zIndex: 30,
                          background: 'var(--white)', border: '1px solid var(--line-2)', borderRadius: 11,
                          boxShadow: '0 16px 40px -12px rgba(15,26,48,0.3)', padding: 6, maxHeight: 200, overflowY: 'auto',
                        }}
                      >
                        {clientesFiltrados.length === 0 && (
                          <div className={styles.loadingRow}>Sin resultados</div>
                        )}
                        {clientesFiltrados.slice(0, 20).map((c) => (
                          <div
                            key={c.idUser}
                            onMouseDown={() => setClienteSeleccionado(c)}
                            style={{ padding: '8px 9px', borderRadius: 8, cursor: 'pointer', fontSize: 12.5 }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F4F8FB'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                            <div className={styles.mutedSmall}>{c.email}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {clienteSeleccionado && (
                <div className={styles.field} style={{ marginBottom: 18 }}>
                  <label className={styles.fieldLabel}>Trámite <span className={styles.req}>*</span></label>
                  {cargandoTramites ? (
                    <div className={styles.loadingRow}>Cargando trámites…</div>
                  ) : tramitesCliente.length === 0 ? (
                    <div className={styles.loadingRow}>Este cliente no tiene trámites registrados</div>
                  ) : (
                    <div className={styles.moneyWrap} style={{ height: 38 }}>
                      <select
                        value={idTramiteSeleccionado}
                        onChange={(e) => setIdTramiteSeleccionado(e.target.value)}
                      >
                        <option value="">Selecciona un trámite</option>
                        {tramitesCliente.map((t) => (
                          <option key={t.idTransactProgress} value={t.idTransact}>{t.transact?.name}</option>
                        ))}
                      </select>
                      <span className={styles.moneySuffix}><IconChevronDown /></span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className={styles.roRow}>
                <div className={styles.roIcon}><IconUser /></div>
                <div><div className={styles.roLbl}>Cliente</div><div className={styles.roVal}>{nombreCliente || 'No disponible'}</div></div>
              </div>
              <div className={styles.roRow} style={{ marginBottom: 18 }}>
                <div className={styles.roIcon}><IconTramite /></div>
                <div><div className={styles.roLbl}>Trámite</div><div className={styles.roVal}>{nombreTramite || 'No disponible'}</div></div>
              </div>
            </>
          )}

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Concepto <span className={styles.req}>*</span></label>
            <select className={styles.inp} value={concepto} onChange={(e) => setConcepto(e.target.value)}>
              <option>Adelanto</option>
              <option>Liquidación restante</option>
            </select>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field} style={{ marginBottom: 0 }}>
              <label className={styles.fieldLabel}>Monto recibido <span className={styles.req}>*</span></label>
              <div className={styles.moneyWrap} style={{ height: 38 }}>
                <span className={styles.moneyPrefix}>$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0"
                />
                <span className={styles.moneySuffix}>MXN</span>
              </div>
            </div>
            <div className={styles.field} style={{ marginBottom: 0 }}>
              <label className={styles.fieldLabel}>Fecha del pago <span className={styles.req}>*</span></label>
              <div className={`${styles.moneyWrap} ${styles.dateWrap}`} style={{ height: 38 }}>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                <span className={styles.dateSuffix}><IconCalendar /></span>
              </div>
            </div>
          </div>

          <div className={styles.cashNote}>
            <IconInfo />
            <div className={styles.cashNoteText}>El pago se registrará en el historial del trámite y actualizará el saldo automáticamente.</div>
          </div>
        </div>

        <div className={styles.modalFoot}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onHide}>Cancelar</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} disabled={!puedeConfirmar} onClick={handleConfirmar}>
            <IconCheck /> {enviando ? 'Confirmando…' : 'Confirmar pago'}
          </button>
        </div>
      </div>
    </div>
  );
}
