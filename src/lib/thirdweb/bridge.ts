import { Bridge, createThirdwebClient } from 'thirdweb';
import { polygon, mainnet } from 'thirdweb/chains';

const client = createThirdwebClient({
  clientId: 'TU_CLIENT_ID',
});

async function bridgeExample() {
  // Obtén las rutas de Polygon a Ethereum
  const routes = await Bridge.routes({
    originChainId: polygon.id,
    destinationChainId: mainnet.id,
    client,
  });

  // Elige la primera ruta y cotiza
  const quote = await Bridge.Buy.quote({
    client,
    originChainId: polygon.id,
    originTokenAddress: routes[0].originToken.address,
    destinationChainId: mainnet.id,
    destinationTokenAddress: routes[0].destinationToken.address,
    amount: 1000000000000000000n, // 1 token en bigint
  });

  console.log(quote);
}

bridgeExample();

export {};
