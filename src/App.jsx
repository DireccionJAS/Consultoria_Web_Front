import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

import Home from "./components/Auth/Home.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import AdminTramites from "./components/Admin/AdminTramites.jsx";
import AdminClientes from "./components/Admin/AdminClientes.jsx";
import AdminPagos from "./components/Admin/AdminPagos.jsx";
import AdminCalendario from "./components/Admin/AdminCalendario.jsx";
import AdminPerfil from "./components/Admin/AdminPerfil.jsx";
import EmpresaDashboard from "./components/Empresa/EmpresaDashboard.jsx";
import EmpresaTramites from "./components/Empresa/EmpresaTramites.jsx";
import EmpresaClientes from "./components/Empresa/EmpresaClientes.jsx";
import EmpresaPagos from "./components/Empresa/EmpresaPagos.jsx";
import EmpresaCalendario from "./components/Empresa/EmpresaCalendario.jsx";
import EmpresaHorarios from "./components/Empresa/EmpresaHorarios.jsx";
import EmpresaServicios from "./components/Empresa/EmpresaServicios.jsx";
import EmpresaAdmins from "./components/Empresa/EmpresaAdmins.jsx";
import EmpresaPaginaPublica from "./components/Empresa/EmpresaPaginaPublica.jsx";
import EmpresaPracticas from "./components/Empresa/EmpresaPracticas.jsx";
import EmpresaRecursos from "./components/Empresa/EmpresaRecursos.jsx";
import EmpresaLegalidad from "./components/Empresa/EmpresaLegalidad.jsx";
import EmpresaPerfil from "./components/Empresa/EmpresaPerfil.jsx";
import AdministradorServicios from "./components/Admin/AdministradorServicios";
import RegistrarTramite from "./components/Administrador/RegistrarTramite";
import RegistrarCliente from './components/Administrador/RegistrarCliente'
import ClienteHome from "./components/Cliente/ClienteHome";
import ClienteServicios from "./components/Cliente/ClienteServicios";
import MisTramites from "./components/Cliente/MisTramites";
import MisTramitesMobile from "./components/Cliente/MisTramitesMobile";
import Calendario from "./components/Cliente/Calendario.jsx";
import ClienteHomeMobile from "./components/Cliente/ClienteHomeMobile.jsx";

import NoAutorizado from "./components/common/NoAutorizado";
import ProtectedRoute from "./components/common/ProtectedRoute";
import OlvidarContra from "./components/Auth/OlvidarContra.jsx";
import MiPerfil from "./components/Cliente/MiPerfil.jsx";
import Formularios from "./components/Cliente/Formularios.jsx";
import Pagos from "./components/Cliente/Pagos.jsx";
import RegistrarPasos from "./components/Administrador/RegistrarPasos.jsx";
import CombinedStepManager from "./components/Administrador/ActualizarPasos.jsx";
import Page0 from "./components/Page0.jsx";
import ServiciosPage from "./components/Landing/ServiciosPage.jsx";
import Signin from "./components/Auth/Singin.jsx";
import UploadPfd from "./components/Administrador/UploadPdf.jsx";
import Practicas from "../Practicas.jsx";

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PruebaPago from "./PruebaPago.jsx";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
