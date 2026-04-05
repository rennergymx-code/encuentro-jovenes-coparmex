import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
  path?: string;
  noindex?: boolean;
}

export default function SEO({ 
  title = 'Encuentro de Jóvenes Coparmex: De Sonora para el Mundo', 
  description = 'Únete al Encuentro de Jóvenes Coparmex. De Sonora para el Mundo: Liderazgo, negocios y networking. Compra tu carnet y no te quedes fuera.', 
  type = 'website',
  path = '',
  noindex = false
}: SEOProps) {
  const siteUrl = 'https://encuentrojovenescoparmex.com'; // Actualizar al dominio real cuando se tenga
  const url = `${siteUrl}${path}`;
  const defaultImage = `${siteUrl}/assets/images/hero-bg.webp`; // Usar una de las imágenes representativas como default de compartir

  return (
    <Helmet>
      {/* Etiqueta de indexación */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Etiquetas Primarias */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={defaultImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={defaultImage} />
    </Helmet>
  );
}
