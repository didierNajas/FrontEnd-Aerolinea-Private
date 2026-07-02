# Aerolínea Frontend

Sitio web estático de ejemplo para una aerolínea, diseñado como frontend independiente y listo para desplegar en GitHub Pages.

## Qué incluye

- Páginas públicas de navegación y servicios (`index.html`, `actividades.html`, `paquetes.html`, etc.)
- Autenticación de usuario simple con inicio de sesión y registro
- Panel administrativo protegido para gestión de pasajeros, vuelos y reservas
- Capa de UI modular con `js/core`, `js/controllers`, `js/services` y `js/views`
- Integración con almacenamiento local para usuarios y sesión

## Cómo ejecutar localmente

1. Abre la carpeta del proyecto en tu editor.
2. Abre `index.html` directamente en el navegador, o usa un servidor local si prefieres:
   ```bash
   npx serve .
   ```
3. Si deseas iniciar sesión de administrador, usa:
   - email: `admin@aerolinea.com`
   - password: `Admin1234`

## Preparado para GitHub Pages

Este proyecto está configurado para desplegarse desde la rama `main` y servir los archivos estáticos desde la raíz del repositorio.

### Pasos rápidos

1. Crea el repositorio en GitHub.
2. Conecta el remoto:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git branch -M main
   git push -u origin main
   ```
3. En GitHub, habilita GitHub Pages:
   - Source: `main`
   - Folder: `/root`

## Estructura del proyecto

- `index.html`: página principal del sitio
- `css/`: estilos y layout
- `js/`: scripts
  - `controllers/`: lógica de página y formularios
  - `core/`: comportamiento compartido de UI
  - `services/`: llamadas a API y gestión de datos
  - `views/`: renderizado de componentes del panel
- `login.html` / `registro.html`: autenticación de usuario
- `panel.html`: panel de administración protegido

## Notas importantes

- El proyecto usa almacenamiento local para simular usuarios y sesiones.
- No requiere backend para navegación básica, pero dispone de servicios preparados para integrar APIs.
- Si quieres usar un dominio personalizado, agrega un archivo `CNAME` con el dominio al repositorio.
