# Navegador, preferencias y publicación — 20 de octubre de 2026

El banner global permite elegir Solo necesarias o Permitir mapas. Google Maps
no se monta antes de permitirlo y se desmonta al retirar la elección. La
preferencia se conserva durante 180 días en almacenamiento local; rechaza
datos corruptos, versiones desconocidas y fechas caducadas. El pie permite
reabrir la elección. Si el navegador bloquea el almacenamiento, la elección
solo dura mientras la aplicación está abierta.

La sesión existente continúa usando localStorage. Esto no cambia los tokens a
cookies HttpOnly. El aviso describe el uso técnico de sesión/acceso/pagos; no
incorpora analítica ni publicidad ni certifica cumplimiento legal integral.
El editor de textos legales de Empresa sigue sin persistencia en servidor;
no controla este banner. Los PDFs conservan su ruta existente.

Stripe se inicializa al montar PaymentElements, mediante stripe-js/pure, en
lugar de cargar scripts desde los módulos importados por la página pública.

## CSP

Se aplican object-src 'none', base-uri 'self' y frame-ancestors 'none'. La política
completa de recursos se envía en Report-Only; no está completamente impuesta.
Las advertencias se observan en consola; no hay un colector externo.
Antes de imponerla hay que observar Google, Stripe (incluido 3DS) y PayPal en
Sandbox. La propuesta no permite unsafe-eval ni scripts inline, pero sí estilos
inline por los componentes actuales. Imágenes HTTPS siguen permitidas por los
recursos configurables.

Referencias del inventario:
- https://docs.stripe.com/security/guide
- https://developer.paypal.com/sdk/js/v5/best-practices/
- https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid

## Clave histórica de Stripe

No se comprobó su vigencia ni se rotó. La revisión automática rechazó recuperar
la clave de Git y autenticar una consulta a Stripe sin autorización específica
para ese método. No se reintentó por otro medio. Su comprobación/rotación queda
pendiente; retirar la cadena del archivo actual no la elimina del historial.

## Evidencia

32 pruebas Node aprobadas y compilación Vite correcta. En navegador local:
banner inicial, rechazo sin mapa, elección conservada tras recargar,
reapertura desde el pie y mapa montado al permitirlo.
