# Aerolínea Frontend

Sitio web estático de la aerolínea listo para desplegar en GitHub Pages.

## Cómo usar

1. Inicializa un repositorio Git en la carpeta si no existe:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Crea un repositorio remoto en GitHub y enlázalo:
   ```bash
   git remote add origin https://github.com/USUARIO/NOMBRE_REPO.git
   git branch -M main
   git push -u origin main
   ```
3. En GitHub, habilita GitHub Pages desde la rama `main` y la carpeta `/root`.

## Estructura

- `index.html`: página principal
- `js/`: scripts del frontend
- `css/`: estilos
- `views/`, `services/`, `controllers/`, `core/`: capas del frontend

## Nota

El proyecto ya está organizado para servir archivos estáticos desde la raíz del repositorio. GitHub Pages puede desplegarlo directamente desde `main` sin configuración adicional.
