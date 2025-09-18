// Solución para el problema de permisos de minteo

/\*\*

- PROBLEMA IDENTIFICADO:
- Los contratos actuales tienen AccessControl activado y requieren MINTER_ROLE
- para poder mintear NFTs. El usuario actual no tiene estos permisos.
-
- DIRECCIONES DE CONTRATOS ACTUALES:
- - ERC-721: 0x61819c90CBF722377Dc81166Fb73747d41b78Ad4
- - ERC-1155: 0xE95c8B7778FE3622b6f17929F2d5D914Bdb6FD10
-
- SOLUCIONES POSIBLES:
-
- 1.  OTORGAR PERMISOS (RECOMENDADO):
- - Ir a thirdweb dashboard
- - Acceder al contrato como administrador
- - Otorgar MINTER_ROLE a la dirección del usuario
-
- 2.  CREAR NUEVOS CONTRATOS DROP:
- - Usar contratos Drop que permiten minteo público
- - No requieren permisos especiales
-
- 3.  USAR FUNCIONES ALTERNATIVAS:
- - claimTo() en lugar de mintTo()
- - Requiere que el contrato tenga claim conditions configuradas
    \*/

// PASO A PASO PARA OTORGAR PERMISOS:

// 1. Ve a https://thirdweb.com/dashboard
// 2. Conecta la wallet del administrador del contrato
// 3. Ve a la sección "Contracts" y selecciona tu contrato
// 4. Ve a "Permissions" en el menú lateral
// 5. Encuentra "MINTER_ROLE"
// 6. Haz clic en "Grant Role"
// 7. Ingresa la dirección de wallet del usuario: {USUARIO_ADDRESS}
// 8. Confirma la transacción

// ALTERNATIVA: Crear nuevos contratos desde cero
const NEW_CONTRACT_OPTIONS = {
type: 'NFT Drop', // Permite minteo público
network: 'Polygon',
settings: {
name: 'Memories NFT Collection',
description: 'Colección de NFTs de recuerdos',
royalty: '5%', // 5% de royalties
primarySale: 'creator_wallet_address'
}
};

export default {};
