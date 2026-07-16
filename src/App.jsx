import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

import Home from "./components/Home/Home.jsx";
import AdministradorHome from "./components/Administrador/AdministradorHome";
import EmpresaDashboard from "./components/Administrador/EmpresaDashboard.jsx";
import EmpresaTramites from "./components/Administrador/EmpresaTramites.jsx";
import EmpresaClientes from "./components/Administrador/EmpresaClientes.jsx";
import EmpresaPagos from "./components/Administrador/EmpresaPagos.jsx";
import EmpresaCalendario from "./components/Administrador/EmpresaCalendario.jsx";
import EmpresaHorarios from "./components/Administrador/EmpresaHorarios.jsx";
import EmpresaServicios from "./components/Administrador/EmpresaServicios.jsx";
import EmpresaAdmins from "./components/Administrador/EmpresaAdmins.jsx";
import EmpresaPaginaPublica from "./components/Administrador/EmpresaPaginaPublica.jsx";
import EmpresaPracticas from "./components/Administrador/EmpresaPracticas.jsx";
import AdministradorServicios from "./components/Administrador/AdministradorServicios";
import AdministradorCliente from "./components/Administrador/AdministradorClientes";
import AdministradorTramites from "./components/Administrador/AdministradorTramites";
import RegistrarServicio from "./components/Administrador/RegistraServicio";
import ActualizarServicio from "./components/Administrador/ActualizarServicio";
import RegistrarTramite from "./components/Administrador/RegistrarTramite";
import RegistrarCliente from './components/Administrador/RegistrarCliente'
import AdministradorPerfil from "./components/Administrador/AdministradorPerfil.jsx";
import ClienteHome from "./components/Cliente/ClienteHome";
import ClienteServicios from "./components/Cliente/ClienteServicios";
import MisTramites from "./components/Cliente/MisTramites";
import MisTramitesMobile from "./components/Cliente/MisTramitesMobile";
import Calendario from "./components/Cliente/Calendario.jsx";
import CalendarioAdmin from "./components/Administrador/CalendarioAdmin.jsx";
import ClienteHomeMobile from "./components/Cliente/ClienteHomeMobile.jsx";

import NoAutorizado from "./components/NoAutorizado";
import ProtectedRoute from "./components/ProtectedRoute";
import OlvidarContra from "./components/Home/OlvidarContra.jsx";
import AdministradorPagos from "./components/Administrador/AdministradorPagos.jsx";
import MiPerfil from "./components/Cliente/MiPerfil.jsx";
import RegistrarPasos from "./components/Administrador/RegistrarPasos.jsx";
import CombinedStepManager from "./components/Administrador/ActualizarPasos.jsx";
import Page0 from "./components/Page0.jsx";
import Signin from "./components/Singin.jsx";
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
        <Route path="/test" element={<PruebaPago />} />
        <Route path="/Signin" element={<Signin />} />
        <Route path="/practicas" element={<Practicas />} />


        <Route path="/olvidar-contra" element={<OlvidarContra />} />

        {/* ADMIN */}
        <Route path="/HomeAdmin" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdministradorHome />
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
            <AdministradorPerfil />
          </ProtectedRoute>
        } />
        <Route path="/ClientesAdmin" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdministradorCliente />
          </ProtectedRoute>
        } />
        <Route path="/Pagos" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdministradorPagos />
          </ProtectedRoute>
        } />
        <Route path="/TramitesAdmin" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdministradorTramites />
          </ProtectedRoute>
        } />
        <Route path="/RegistrarServicio" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <RegistrarServicio />
          </ProtectedRoute>
        } />
        <Route path="/ActualizarServicio" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <ActualizarServicio />
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
            <CalendarioAdmin />
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
