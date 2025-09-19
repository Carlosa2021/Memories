## NFT RECUERDOS

Aplicación Web3 (Next.js + thirdweb + OpenAI) para crear NFTs de recuerdos de forma manual o asistida por IA, soportando ERC-721 (único) y ERC-1155 (múltiples ediciones) mediante contratos Drop (Edition Drop) que permiten `claim` sin requerir rol de minteo en el frontend.

## Stack Principal

| Capa      | Tecnología                                    |
| --------- | --------------------------------------------- |
| Framework | Next.js 15 (App Router)                       |
| Lenguaje  | TypeScript / React 19                         |
| Web3 SDK  | thirdweb v5                                   |
| AI        | OpenAI (Chat completions + DALL·E 3 imágenes) |
| Estilos   | TailwindCSS                                   |

## Rutas Clave

- `src/app/crear-nft/page.tsx`: UI principal para crear NFT (manual o IA) y seleccionar tipo 721 / 1155.
- `src/app/api/generate-nft-metadata/route.ts`: Genera nombre, descripción e imagen IA (base64) con OpenAI.
- `src/lib/contracts.ts`: Exporta instancias de contratos (Edition Drop) usados para reclamar/mint.

## Variables de Entorno (local y Vercel)

Crear un archivo `.env.local` (no se commitea) con:

```
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=xxxxxxxxxxxxxxxx
THIRDWEB_SECRET_KEY=xxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

En Vercel, añadir exactamente los mismos nombres (Scope: Production + Preview + Development).

Nunca publiques las claves privadas. Solo `NEXT_PUBLIC_...` puede exponerse al cliente. Las demás permanecen server-side.

## Flujo de Creación de NFT

1. Usuario elige: Manual o IA.
2. (IA) Se envía prompt al endpoint `/api/generate-nft-metadata` que:
   - Usa Chat Completions para obtener JSON con `name` y `description`.
   - Genera imagen con DALL·E 3.
   - Devuelve metadata + imagen en base64.
3. Usuario revisa/edita metadata y confirma.
4. Imagen + metadata se suben a IPFS vía thirdweb storage.
5. Se ejecuta `claimTo` sobre el Edition Drop (ERC-1155) o el NFT Drop (ERC-721) según selección.
6. UI muestra estado y hash de transacción / errores.

## Contratos

Actualmente se utilizan direcciones configuradas en `src/lib/contracts.ts` (Edition Drop). Si necesitas cambiar contratos:

1. Crea/Configura contrato en thirdweb dashboard.
2. Copia la dirección y actualiza el archivo.
3. (Opcional) Ajusta `tokenId` si reclamas un ID distinto (por defecto 0 cuando se crean primeras ediciones).

### Claim Conditions (Importante)

Debes configurar en el dashboard de thirdweb las claim conditions (precio, supply, fecha inicio) para el tokenId que se va a reclamar. Sin condición activa la llamada `claimTo` fallará o retornará error de elegibilidad.

Pasos rápidos:

1. Ve al dashboard del Edition Drop.
2. Selecciona el `tokenId` (por ej. 0) o crea uno nuevo.
3. Define Supply total y cantidad máxima por transacción.
4. Guarda los cambios (Publish / Save Claim Conditions).

## Desarrollo Local

Instalar dependencias:

```
npm install
```

Levantar entorno dev:

```
npm run dev
```

Abrir: http://localhost:3000

## Scripts

```
npm run dev       # Entorno desarrollo
npm run build     # Build producción
npm start         # Servir build
```

## Despliegue en Vercel (Nuevo Proyecto)

1. Asegúrate de que el repositorio remoto (GitHub) está actualizado (`main`).
2. En Vercel: "Add New..." -> "Project".
3. Importa el repositorio.
4. Nombre del proyecto: usar solo letras, números y guiones medios/underscore (evitar nombres usados previamente si se eliminaron hace poco).
5. Añade variables de entorno (Build & Runtime) copiando desde `.env.local`.
6. Framework detectado: Next.js (no necesitas modificar). Output: `.next`.
7. Deploy. Esperar build (logs deben mostrar instalación y `next build`).
8. Probar página `/crear-nft` y realizar un mint de prueba.

## Troubleshooting

| Problema                                             | Causa                             | Solución                                    |
| ---------------------------------------------------- | --------------------------------- | ------------------------------------------- |
| `AccessControl: account is missing role MINTER_ROLE` | Usabas contrato con rol requerido | Cambiar a Drop / asignar rol via dashboard  |
| Claim falla sin mensaje claro                        | Falta claim condition activa      | Configurar claim conditions para tokenId    |
| 429 en OpenAI                                        | Rate limit o cuota                | Esperar / revisar plan / reducir frecuencia |
| Imagen IA corrompida                                 | Descarga interrumpida             | Reintentar generación                       |

## Seguridad

- No commitear `.env.local` (ya ignorado en `.gitignore`).
- Revisa que no expongas claves privadas de wallet.
- Limita supply y claim conditions para evitar agotamiento accidental.

## Próximas Mejores Prácticas (Pendiente / Opcional)

- Tests básicos de API (Jest o Vitest).
- Persistir logs de errores críticos (Sentry / similar).
- UI de gestión de claim conditions.

## Licencia

Proyecto educativo / interno. Añade una licencia específica si se va a hacer público.
