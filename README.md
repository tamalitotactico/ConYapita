
# ConYapita

Aplicación móvil construida con [Expo](https://expo.dev/) y React Native, usando Supabase como backend.

## Requisitos previos

- [Node.js](https://nodejs.org/) >= 18
- [Yarn](https://yarnpkg.com/) o [npm](https://www.npmjs.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/):
  ```bash
  npm install -g expo-cli
  ```

## Instalación

1. Clona el repositorio:
	```bash
	git clone https://github.com/tamalitotactico/ConYapita.git
	cd ConYapita
	```
2. Instala las dependencias:
	```bash
	npm install
	# o
	yarn install
	```

3. Crea un archivo `.env` con tus variables de entorno necesarias (por ejemplo, claves de Supabase).

## Ejecución

Para iniciar la aplicación en modo desarrollo:

```bash
npm run dev
# o
yarn dev
```

Esto abrirá el servidor de desarrollo de Expo. Puedes escanear el QR con la app de Expo Go en tu dispositivo móvil o usar un emulador.

## Scripts útiles

- `npm run dev` — Inicia el servidor de desarrollo de Expo
- `npm run build:web` — Genera la versión web
- `npm run lint` — Linting del proyecto
- `npm run typecheck` — Verifica los tipos TypeScript

## Estructura del proyecto

- `app/` — Código fuente principal y rutas
- `components/` — Componentes reutilizables
- `contexts/` — Contextos de React
- `hooks/` — Custom hooks
- `lib/` — Librerías y utilidades (ej: Supabase)
- `assets/` — Imágenes y recursos estáticos
- `supabase/` — Migraciones y archivos relacionados a la base de datos

## Notas

- Asegúrate de tener configuradas las variables de entorno necesarias para conectar con Supabase.
- Consulta la documentación de Expo y Supabase para más detalles sobre configuración avanzada.

---
Hecho con ❤️ por el equipo de ConYapita.
