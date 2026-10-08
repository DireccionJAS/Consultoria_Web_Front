import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

const Home = lazy(() => import("./components/Auth/Home.jsx"));
const AdminDashboard = lazy(() => import("./components/Admin/AdminDashboard.jsx"));
const AdminTramites = lazy(() => import("./components/Admin/AdminTramites.jsx"));
const AdminClientes = lazy(() => import("./components/Admin/AdminClientes.jsx"));
const AdminFormularios = lazy(() => import("./components/Admin/AdminFormularios.jsx"));
const AdminPagos = lazy(() => import("./components/Admin/AdminPagos.jsx"));
const AdminCalendario = lazy(() => import("./components/Admin/AdminCalendario.jsx"));
const AdminPerfil = lazy(() => import("./components/Admin/AdminPerfil.jsx"));
const EmpresaDashboard = lazy(() => import("./components/Empresa/EmpresaDashboard.jsx"));
const EmpresaTramites = lazy(() => import("./components/Empresa/EmpresaTramites.jsx"));
const EmpresaClientes = lazy(() => import("./components/Empresa/EmpresaClientes.jsx"));
const EmpresaPagos = lazy(() => import("./components/Empresa/EmpresaPagos.jsx"));
const EmpresaCalendario = lazy(() => import("./components/Empresa/EmpresaCalendario.jsx"));
const EmpresaHorarios = lazy(() => import("./components/Empresa/EmpresaHorarios.jsx"));
const EmpresaServicios = lazy(() => import("./components/Empresa/EmpresaServicios.jsx"));
const EmpresaAdmins = lazy(() => import("./components/Empresa/EmpresaAdmins.jsx"));
const EmpresaPaginaPublica = lazy(() => import("./components/Empresa/EmpresaPaginaPublica.jsx"));
const EmpresaPracticas = lazy(() => import("./components/Empresa/EmpresaPracticas.jsx"));
const EmpresaRecursos = lazy(() => import("./components/Empresa/EmpresaRecursos.jsx"));
const EmpresaLegalidad = lazy(() => import("./components/Empresa/EmpresaLegalidad.jsx"));
const EmpresaPerfil = lazy(() => import("./components/Empresa/EmpresaPerfil.jsx"));
const AdministradorServicios = lazy(() => import("./components/Admin/AdministradorServicios"));
const RegistrarTramite = lazy(() => import("./components/Administrador/RegistrarTramite"));
const RegistrarCliente = lazy(() => import('./components/Administrador/RegistrarCliente'));
const ClienteHome = lazy(() => import("./components/Cliente/ClienteHome"));
const ClienteServicios = lazy(() => import("./components/Cliente/ClienteServicios"));
const MisTramites = lazy(() => import("./components/Cliente/MisTramites"));
const MisTramitesMobile = lazy(() => import("./components/Cliente/MisTramitesMobile"));
const Calendario = lazy(() => import("./components/Cliente/Calendario.jsx"));
const ClienteHomeMobile = lazy(() => import("./components/Cliente/ClienteHomeMobile.jsx"));

import NoAutorizado from "./components/common/NoAutorizado";
import ProtectedRoute from "./components/common/ProtectedRoute";
const OlvidarContra = lazy(() => import("./components/Auth/OlvidarContra.jsx"));
const MiPerfil = lazy(() => import("./components/Cliente/MiPerfil.jsx"));
const Formularios = lazy(() => import("./components/Cliente/Formularios.jsx"));
const Pagos = lazy(() => import("./components/Cliente/Pagos.jsx"));
const RegistrarPasos = lazy(() => import("./components/Administrador/RegistrarPasos.jsx"));
const CombinedStepManager = lazy(() => import("./components/Administrador/ActualizarPasos.jsx"));
const Page0 = lazy(() => import("./components/Page0.jsx"));
const ServiciosPage = lazy(() => import("./components/Landing/ServiciosPage.jsx"));
const Signin = lazy(() => import("./components/Auth/Singin.jsx"));
const UploadPfd = lazy(() => import("./components/Administrador/UploadPdf.jsx"));
const Practicas = lazy(() => import("../Practicas.jsx"));

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
const PruebaPago = lazy(() => import("./PruebaPago.jsx"));
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function App() {
  return (
    <Router>
      <Suspense fallback={null}>
      <Routes>
        {/* Stripe solo para esta ruta */}
        <Route path="/ClienteServicios" element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <Elements stripe={stripePromise}>
              <ClienteServicios />
            </Elements>
          </ProtectedRoute>
        } />
        <Route path="/ClienteServicios-sm" element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <Elements stripe={stripePromise}>
              <ClienteServicios />
            </Elements>
          </ProtectedRoute>
        } />

        <Route path="/Login" element={<Home />} />
        <Route path="/" element={<Page0 />} />
        <Route path="/Servicios" element={<ServiciosPage />} />
        <Route path="/test" element={<PruebaPago />} />
        <Route path="/Signin" element={<Signin />} />
        <Route path="/practicas" element={<Practicas />} />


        <Route path="/olvidar-contra" element={<OlvidarContra />} />

        {/* ADMIN */}
        <Route path="/HomeAdmin" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* EMPRESA */}
        <Route path="/HomeEmpresa" element={
          <ProtectedRoute allowedRoles={["EMPRESA"]}>
            <EmpresaDashboard />
          </ProtectedRoute>
        } />
        <Route path="/EmpresaTramites" element={
          <ProtectedRoute allowedRoles={["EMPRESA"]}>
            <EmpresaTramites />
          </ProtectedRoute>
        } />
        <Route path="/EmpresaClientes" element={
          <ProtectedRoute allowedRoles={["EMPRESA"]}>
            <EmpresaClientes />
          </ProtectedRoute>
        } />
        <Route path="/EmpresaPagos" element={
          <ProtectedRoute allowedRoles={["EMPRESA"]}>
            <EmpresaPagos />
          </ProtectedRoute>
        } />
        <Route path="/EmpresaCalendario" element={
          <ProtectedRoute allowedRoles={["EMPRESA"]}>
            <EmpresaCalendario />
          </ProtectedRoute>
        } />
        <Route path="/EmpresaHorarios" element={
          <ProtectedRoute allowedRoles={["EMPRESA"]}>
            <EmpresaHorarios />
          </ProtectedRoute>
        } />
        <Route path="/EmpresaServicios" element={
          <ProtectedRoute allowedRoles={["EMPRESA"]}>
            <EmpresaServicios />
          </ProtectedRoute>
        } />
        <Route path="/EmpresaAdmins" element={
          <ProtectedRoute allowedRoles={["EMPRESA"]}>
            <EmpresaAdmins />
          </ProtectedRoute>
        } />
        <Route path="/EmpresaPaginaPublica" element={
          <ProtectedRoute allowedRoles={["EMPRESA"]}>
            <EmpresaPaginaPublica />
          </ProtectedRoute>
        } />
        <Route path="/EmpresaPracticas" element={
          <ProtectedRoute allowedRoles={["EMPRESA"]}>
            <EmpresaPracticas />
          </ProtectedRoute>
        } />
        <Route path="/EmpresaRecursos" element={
          <ProtectedRoute allowedRoles={["EMPRESA"]}>
            <EmpresaRecursos />
          </ProtectedRoute>
        } />
        <Route path="/EmpresaLegalidad" element={
          <ProtectedRoute allowedRoles={["EMPRESA"]}>
            <EmpresaLegalidad />
          </ProtectedRoute>
        } />
        <Route path="/EmpresaPerfil" element={
          <ProtectedRoute allowedRoles={["EMPRESA"]}>
            <EmpresaPerfil />
          </ProtectedRoute>
        } />
        <Route path="/PDF" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <UploadPfd />
          </ProtectedRoute>
        } />
        <Route path="/ServiciosAdmin" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdministradorServicios />
          </ProtectedRoute>
        } />
        <Route path="/Perfil" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminPerfil />
          </ProtectedRoute>
        } />
        <Route path="/PerfilAdmin" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminPerfil />
          </ProtectedRoute>
        } />
        <Route path="/FormulariosAdmin" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminFormularios />
          </ProtectedRoute>
        } />
        <Route path="/ClientesAdmin" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminClientes />
          </ProtectedRoute>
        } />
        <Route path="/Pagos" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminPagos />
          </ProtectedRoute>
        } />
        <Route path="/PagosAdmin" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminPagos />
          </ProtectedRoute>
        } />
        <Route path="/TramitesAdmin" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminTramites />
          </ProtectedRoute>
        } />
        <Route path="/RegistrarTramite" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <RegistrarTramite />
          </ProtectedRoute>
        } />
        <Route path="/RegistrarCliente" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <RegistrarCliente />
          </ProtectedRoute>
        } />
        <Route path="/RegistrarPasos" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <RegistrarPasos />
          </ProtectedRoute>
        } />
        <Route path="/ActualizarPasos" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <CombinedStepManager />
          </ProtectedRoute>
        } />
        <Route path="/Calendar" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminCalendario />
          </ProtectedRoute>
        } />
        <Route path="/CalendarioAdmin" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminCalendario />
          </ProtectedRoute>
        } />

        <Route path="/ClienteHome" element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <ClienteHome />
          </ProtectedRoute>
        } />
        <Route path="/ClienteHome-sm" element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <ClienteHomeMobile />
          </ProtectedRoute>
        } />
        <Route path="/MiPerfil" element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <MiPerfil />
          </ProtectedRoute>
        } />
        <Route path="/Formularios" element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <Formularios />
          </ProtectedRoute>
        } />
        <Route path="/ClientePagos" element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <Pagos />
          </ProtectedRoute>
        } />
        <Route path="/MisTramites" element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <Elements stripe={stripePromise}>
              <MisTramites />
            </Elements>
          </ProtectedRoute>
        } />

        <Route path="/MisTramites-sm" element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <MisTramitesMobile />
          </ProtectedRoute>
        } />
        <Route path="/Calendario" element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <Calendario />
          </ProtectedRoute>
        } />

        <Route path="/no-encontrado" element={<NoAutorizado />} />
      </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
