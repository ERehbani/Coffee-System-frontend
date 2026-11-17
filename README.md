# Coffee System - Frontend

Cliente web de Coffee System (Roast & Rewards), un sistema de fidelización para cafeterías. Lo usan los clientes, las cafeterías y los administradores, cada uno con sus propias pantallas. Está hecho con Angular.

## Requisitos

- Node.js y npm (la versión de npm está fijada en `package.json`).
- El backend de Coffee System en ejecución en `http://localhost:8080`. En desarrollo, `proxy.conf.json` redirige a esa dirección las llamadas que empiezan con `/api`.

## Comandos

```bash
npm install     # instala las dependencias
npm start       # levanta el servidor de desarrollo
npm run build   # genera la versión de producción en dist/
npm test        # ejecuta las pruebas
```

## Producción

Después de `npm run build`, el servidor Node se inicia con `npm run serve:ssr:coffee-system-frontend`. Con `NODE_ENV=production` hay que definir la variable `API_URL` con la dirección del backend.
