import { BuyDirectListingButton } from 'thirdweb/react';
import { polygon } from 'thirdweb/chains';
import { client } from '@/lib/thirdweb/client-browser';
import { Button } from '@/components/ui/button';

interface BuyModalProps {
  open: boolean;
  onClose: () => void;
  listingId: string | number | bigint;
  // No necesitas price ni currency para el botón universal
}

export const BuyModal = ({ open, onClose, listingId }: BuyModalProps) => {
  if (!open) return null;
  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        zIndex: 9999,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.2)',
      }}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: 400,
          margin: '100px auto',
          background: 'white',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 10px 24px #0002',
        }}
      >
        <h2>Confirmar Compra</h2>
        <p>¿Deseas comprar esta propiedad?</p>
        <BuyDirectListingButton
          contractAddress={'0x3fD5B4F1058416ea6BEeAc7dd3b239DD014a07a6'}
          listingId={
            typeof listingId === 'bigint' ? listingId : BigInt(listingId)
          }
          quantity={1n}
          // Asegúrate de importar client y polygon según tu proyecto
          client={client}
          chain={polygon}
          onTransactionConfirmed={() => {
            alert('¡Compra realizada con éxito!');
            onClose();
          }}
          onError={(err) => alert('Error en la compra: ' + err.message)}
        >
          Confirmar compra
        </BuyDirectListingButton>
        <Button variant="ghost" onClick={onClose} style={{ marginTop: 12 }}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};
