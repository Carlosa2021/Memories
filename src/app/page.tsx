'use client';
import Link from 'next/link';
import { HeroMemories } from '../components/HeroMemories';

export default function Home() {
  return (
    <>
      <HeroMemories />

      {/* Sección de beneficios/valores del marketplace */}
      <section className="w-full flex flex-col md:flex-row justify-center items-stretch gap-10 py-14 bg-white border-t">
        <div className="flex-1 px-4 max-w-xs text-center">
          <h3 className="text-xl font-bold text-indigo-700 mb-2">
            Comparte y preserva
          </h3>
          <p className="text-gray-500">
            Inmortaliza recuerdos familiares, sociales, viajes y momentos
            creativos con NFTs únicos o ediciones especiales.
          </p>
        </div>
        <div className="flex-1 px-4 max-w-xs text-center">
          <h3 className="text-xl font-bold text-indigo-700 mb-2">
            Creador manual & IA integrada
          </h3>
          <p className="text-gray-500">
            Crea tu NFT desde cero con tu propio diseño o deja que nuestra IA te
            ayude a generar arte y metadata únicos.
          </p>
        </div>
        <div className="flex-1 px-4 max-w-xs text-center">
          <h3 className="text-xl font-bold text-indigo-700 mb-2">
            Propiedad & seguridad Web3
          </h3>
          <p className="text-gray-500">
            Todos los NFTs existen en Polygon y están protegidos por contratos
            inteligentes. Autenticidad, verificación y true ownership.
          </p>
        </div>
      </section>

      {/* Llamado secundario */}
      <section className="flex flex-col items-center justify-center py-14 bg-indigo-50 border-t border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-800">
          ¿Quieres crear tu propio NFT de un momento especial?
        </h2>
        <Link href="/crear-nft">
          <button className="bg-indigo-500 hover:bg-indigo-700 text-white px-7 py-3 rounded-full text-base font-bold shadow-md">
            Empieza ahora
          </button>
        </Link>
      </section>
    </>
  );
}
