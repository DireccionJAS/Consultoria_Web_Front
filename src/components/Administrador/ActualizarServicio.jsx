import React, { useState, useEffect } from 'react';
import Navbar from './../NavbarAdmin.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { updateService } from './../../api/api.js';
import styles from './../../styles/ActualizarServicio.module.css';
import Swal from 'sweetalert2';
import { Icon } from '@iconify/react/dist/iconify.js';


export default function ActualizarServicio() {
  const navigate = useNavigate();
  const location = useLocation();
  const service = location.state?.service;

  const [imagenNombre, setImagenNombre] = useState(service?.image ? "Imagen actual" : "Ningún archivo seleccionado");
  const [imagenDetalleNombre, setImagenDetalleNombre] = useState(service?.imageDetail ? "Imagen actual" : "Ningún archivo seleccionado");
  const [imagenPreview, setImagenPreview] = useState(service?.image || null);
  const [imagenDetallePreview, setImagenDetallePreview] = useState(service?.imageDetail || null);
  const [tieneOtroCosto, setTieneOtroCosto] = useState(service?.nameOption ? true : false);
  const [tieneAnticipo, setTieneAnticipo] = useState(service?.cashAdvance !== service?.totalPayment);
  const [esCita, setEsCita] = useState(service?.isDateService || false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

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
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    const imageFile = formData.get('image');
    const imageDetailFile = formData.get('imageDetail');
   

    const serviceData = {
      name: formData.get('name'),
      description: formData.get('description'),
      image: imageFile && imageFile.size > 0 ? await convertToBase64(imageFile) : service?.image,
      imageDetail: imageDetailFile && imageDetailFile.size > 0 ? await convertToBase64(imageDetailFile) : service?.imageDetail,
      simulation: !esCita && formData.get('simulation') === 'on',
      cas: !esCita && formData.get('cas') === 'on',
      con: !esCita && formData.get('con') === 'on',
      totalPayment: service?.totalPayment,
      status: formData.get('status') === 'on',
      cashAdvance: tieneAnticipo ? parseFloat(formData.get('cashAdvance')) : parseFloat(formData.get('cost')),
      cost: parseFloat(formData.get('cost')),
      nameOption: tieneOtroCosto ? formData.get('nameOption') : "",
      optionCost: tieneOtroCosto ? (formData.get('optionCost') ? parseFloat(formData.get('optionCost')) : "") : "",
      isDateService: formData.get('isDateService') === 'on',
    };

    try {
      const response = await updateService(service.idTransact, serviceData);
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'El servicio se ha actualizado exitosamente',
          text: 'Servicio actualizado con exito',
          confirmButtonText: 'Continuar',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/ServiciosAdmin");
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar el servicio',
          text: 'Hubo un problema al actualizar el servicio. Por favor, inténtelo de nuevo.',
        });
      }
    } catch (error) {
      alert('Error al actualizar el servicio');
      console.error('Error:', error);
    }
  };
   const volver = () => {
      navigate('/ServiciosAdmin'); // Redireccionar a la lista de servicios
    }

  return (
    <div style={{ marginTop: '80px' }}>
      <div className='fixed-top'>
        <Navbar title={isMobile ? "- Actualizar" : "- Actualizar Servicio"} />
      </div>

      <div className={styles['container-registrar-tramite']}>
        <div className={styles['card-registrar-tramite']}>
          <h2>Actualizar Servicio</h2>
          <form className={styles['form-registrar-tramite']} onSubmit={handleSubmit}>
            <div className={styles['form-group']}>
              <label htmlFor='nombre'>Nombre del Trámite *</label>
              <input type='text' id='nombre' name='name' defaultValue={service?.name} required />
            </div>

            <div className={styles['form-group']}>
              <label htmlFor='descripcion'>Descripción *</label>
              <textarea id='descripcion' name='description' defaultValue={service?.description} required></textarea>
            </div>
            <div className={styles['form-group']}>
              <label htmlFor='imagen'>Imagen *</label>
              <input
                type='file'
                id='imagen'
                name='image'
                accept='image/*'
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImagenNombre(file.name);
                    setImagenPreview(URL.createObjectURL(file));
                  } else {
                    setImagenNombre(service?.image ? "Imagen actual" : "Ningún archivo seleccionado");
                    setImagenPreview(service?.image || null);
                  }
                }}
              />
              <label htmlFor='imagen' className={styles['custom-file-button']}>Seleccionar imagen</label>
              <span className={styles['file-name']}>{imagenNombre}</span>
              {imagenPreview && (
                <img src={imagenPreview} alt="Vista previa" className={styles['preview-img']} />
              )}
            </div>

            <div className={styles['form-group']}>
              <label htmlFor='imagenDetalle'>Imagen de detalles *</label>
              <input
                type='file'
                id='imagenDetalle'
                name='imageDetail'
                accept='image/*'
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImagenDetalleNombre(file.name);
                    setImagenDetallePreview(URL.createObjectURL(file));
                  } else {
                    setImagenDetalleNombre(service?.imageDetail ? "Imagen actual" : "Ningún archivo seleccionado");
                    setImagenDetallePreview(service?.imageDetail || null);
                  }
                }}
              />
              <label htmlFor='imagenDetalle' className={styles['custom-file-button']}>Seleccionar imagen</label>
              <span className={styles['file-name']}>{imagenDetalleNombre}</span>
              {imagenDetallePreview && (
                <img src={imagenDetallePreview} alt="Vista previa detalle" className={styles['preview-img']} />
              )}
            </div>

            <div className={styles['form-group']}>
              <label htmlFor='cost'>Costo Total *</label>
              <input
                type='number'
                id='cost'
                name='cost'
                step='any'
                defaultValue={service?.cost}
                required
                onChange={(e) => {
                  if (!tieneAnticipo) {
                    // Si no tiene anticipo, actualizar el campo de anticipo
                    const form = e.target.form;
                    if (form.cashAdvance) {
                      form.cashAdvance.value = e.target.value;
                    }
                  }
                }}
              />
            </div>
            <div className={styles['form-group-switch']}>
              <label htmlFor='status'>Estado del servicio</label>
              <label className={styles['switch']}>
                <input
                  type='checkbox'
                  id='status'
                  name='status'
                  defaultChecked={service?.status}
                />

                <span className={`${styles['slider']} ${styles['round']}`}></span>
              </label>
            </div>

            <div className={styles['form-group-switch']}>
              <label htmlFor='isDateService'>¿El servicio es una cita?</label>
              <label className={styles['switch']}>
                <input
                  type='checkbox'
                  id='isDateService'
                  name='isDateService'
                  checked={esCita}
                  onChange={(e) => {
                    setEsCita(e.target.checked);
                    if (e.target.checked) {
                      // Si es una cita, desactivar y limpiar los otros campos
                      const form = e.target.form;
                      form.simulation.checked = false;
                      form.cas.checked = false;
                      form.con.checked = false;
                    }
                  }}
                />
                <span className={`${styles['slider']} ${styles['round']}`}></span>
              </label>
            </div>

            <div className={styles['form-group-switch']}>
              <label htmlFor='tieneAnticipo'>¿Requiere anticipo diferente?</label>
              <label className={styles['switch']}>
                <input
                  type='checkbox'
                  id='tieneAnticipo'
                  checked={tieneAnticipo}
                  onChange={(e) => {
                    setTieneAnticipo(e.target.checked);
                    if (!e.target.checked) {
                      const form = e.target.form;
                      if (form.cost) {
                        form.cashAdvance.value = form.cost.value;
                      }
                    }
                  }}
                />
                <span className={`${styles['slider']} ${styles['round']}`}></span>
              </label>
            </div>

            {tieneAnticipo && (
              <div className={styles['form-group']}>
                <label htmlFor='anticipoEfectivo'>Anticipo de Efectivo *</label>
                <input
                  type='number'
                  id='anticipoEfectivo'
                  name='cashAdvance'
                  step='any'
                  defaultValue={service?.cashAdvance}
                  required={tieneAnticipo}
                />
              </div>
            )}

            <div className={styles['form-group-switch']}>
              <label htmlFor='tieneOtroCosto'>¿Tiene otro costo?</label>
              <label className={styles['switch']}>
                <input
                  type='checkbox'
                  id='tieneOtroCosto'
                  checked={tieneOtroCosto}
                  onChange={(e) => {
                    setTieneOtroCosto(e.target.checked);
                    if (!e.target.checked) {
                      const form = e.target.form;
                      // Limpiar los campos cuando se desactiva
                      if (form.nameOption) form.nameOption.value = '';
                      if (form.optionCost) form.optionCost.value = '';
                    }
                  }}
                />
                <span className={`${styles['slider']} ${styles['round']}`}></span>
              </label>
            </div>




            {tieneOtroCosto && (
              <>
                <div className={styles['form-group']}>
                  <label htmlFor='nameOption'>Nombre de la Opción *</label>
                  <input
                    type='text'
                    id='nameOption'
                    name='nameOption'
                    defaultValue={service?.nameOption}
                    required={tieneOtroCosto}
                  />
                </div>

                <div className={styles['form-group']}>
                  <label htmlFor='optionCost'>Costo de la Opción *</label>
                  <input
                    type='number'
                    id='optionCost'
                    name='optionCost'
                    step='any'
                    defaultValue={service?.optionCost}
                    required={tieneOtroCosto}
                  />
                </div>
              </>
            )}

            {!esCita && (
              <>
                <div className={styles['form-group-switch']}>
                  <label htmlFor='simulacion'>Requiere simulación *</label>
                  <label className={styles['switch']}>
                    <input
                      type='checkbox'
                      id='simulacion'
                      name='simulation'
                      defaultChecked={service?.simulation}
                      disabled={esCita}
                    />
                    <span className={`${styles['slider']} ${styles['round']}`}></span>
                  </label>
                </div>

                <div className={styles['form-group-switch']}>
                  <label htmlFor='cas'>CAS *</label>
                  <label className={styles['switch']}>
                    <input
                      type='checkbox'
                      id='cas'
                      name='cas'
                      defaultChecked={service?.cas}
                      disabled={esCita}
                    />
                    <span className={`${styles['slider']} ${styles['round']}`}></span>
                  </label>
                </div>

                <div className={styles['form-group-switch']}>
                  <label htmlFor='con'>CON *</label>
                  <label className={styles['switch']}>
                    <input
                      type='checkbox'
                      id='con'
                      name='con'
                      defaultChecked={service?.con}
                      disabled={esCita}
                    />
                    <span className={`${styles['slider']} ${styles['round']}`}></span>
                  </label>
                </div>
              </>
            )}

            <p className={styles['required-fields-note']}>* Campos obligatorios</p>
            <button type="button" onClick={volver} className="custom-file-button" style={{ backgroundColor: '#2c5282', color: 'white' }}>
              <Icon icon="humbleicons:arrow-left" width="24" height="24" color='white' /> Volver
            </button>
            <button type='submit' className={styles['button-submit-service']}>Actualizar</button>
          </form>
        </div>
      </div>
    </div>
  );
}