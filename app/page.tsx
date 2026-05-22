import { redirect } from 'next/navigation';

/**
 * Landing pública — redirige a /catalog.
 * Los clientes llegan desde Instagram a /catalog directamente.
 */
export default function HomePage() {
  redirect('/catalog');
}
