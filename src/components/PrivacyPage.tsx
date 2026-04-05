import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import SEO from './SEO';

interface PrivacyPageProps {
  onBack: () => void;
}

export default function PrivacyPage({ onBack }: PrivacyPageProps) {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-slate-300">
      <SEO title="Aviso de Privacidad | Encuentro Jóvenes Coparmex" path="/legal/privacidad" />
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center gap-2 text-branding-orange hover:text-orange-400 transition-colors mb-12 group font-bold uppercase tracking-widest text-xs"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Volver al Inicio
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism p-8 md:p-12 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Lock className="text-branding-orange w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
            Aviso de <span className="text-branding-orange">Privacidad</span>
          </h1>
        </div>

        <div className="space-y-8 text-sm md:text-base leading-relaxed opacity-90 font-medium">
          <section>
            <p>
              Conforme a lo dispuesto en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (la “Ley”), ponemos a su disposición el presente Aviso de Privacidad, a efecto de garantizar la privacidad y el derecho a la autodeterminación informativa de las personas. El presente Aviso de Privacidad es aplicable con respecto de cualquier información concerniente a una persona física identificada o identificable, recabados para el "Encuentro Jóvenes Coparmex".
            </p>
            <p className="mt-4">
              Los datos personales recabados por nuestra institución no son obtenidos a través de medios engañosos o fraudulentos. Entendemos y respetamos que existe la expectativa razonable de privacidad respecto de los datos personales proporcionados por los titulares de derechos (el “Titular” o los “Titulares”).
            </p>
            <p className="mt-4">
              Se entiende que el Titular consiente tácitamente el tratamiento de sus datos conforme al presente Aviso de Privacidad, el cual se encuentra a su disposición en forma electrónica en este portal, al adquirir un acceso o registrarse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">1. Identidad y Domicilio del Responsable</h2>
            <p>
              El presente Aviso de Privacidad es aplicable al CENTRO EMPRESARIAL DEL NORTE DE SONORA S.P., conocido institucionalmente como COPARMEX SONORA NORTE, siendo éste el “Responsable” en términos de lo dispuesto en la Ley. El domicilio convencional de COPARMEX SONORA NORTE se encuentra ubicado en la Ciudad de Hermosillo, Sonora, México.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">2. Finalidades del Tratamiento de Datos</h2>
            <p>
              El uso de los datos personales recabados abarca cualquier acción de acceso, manejo, aprovechamiento, transferencia o disposición. Los datos que son recabados por COPARMEX SONORA NORTE en el contexto del "Encuentro Jóvenes Coparmex" son para:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>El registro, identificación y acreditación de los asistentes al evento.</li>
              <li>Envío de carnets digitales (códigos QR), correos informativos y logísticos relacionados con el Encuentro.</li>
              <li>Facturación y comprobación fiscal por concepto de la venta de accesos.</li>
              <li>Fines estadísticos, de análisis de alcance del evento y de vinculación con la comunidad empresarial.</li>
              <li>Gestionar el acceso, control y seguridad el día del evento.</li>
            </ul>
            <p className="mt-4">
              Para cumplir con estas finalidades, COPARMEX SONORA NORTE podrá compartir con terceros patrocinadores o aliados logísticos, únicamente información disociada o datos de contacto sumamente necesarios (como el registro de gafetes), asegurando en todo momento que su uso se restrinja al evento o a beneficios directos relacionados con el mismo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">3. Opciones y Medios para Limitar el Uso de Datos</h2>
            <p>
              El Responsable mantendrá medidas de seguridad administrativas, técnicas y físicas que permitan proteger los datos personales contra daño, pérdida, alteración, destrucción o el uso, acceso o tratamiento no autorizado. 
            </p>
            <p className="mt-4">
              El Responsable y los terceros que intervengan en cualquier fase del tratamiento deberán guardar confidencialidad respecto a los mismos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">4. Medios para ejercer Derechos ARCO</h2>
            <p>
              Cualquier Titular, o en su caso su representante legal, podrá ejercer los derechos de Acceso, Rectificación, Cancelación u Oposición (Derechos ARCO). El ejercicio de cualquiera de ellos no es requisito previo ni impedirá el ejercicio de otro.
            </p>
            <p className="mt-4">
              Cualquier solicitud de ejercicio de Derechos ARCO deberá contener:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>El nombre del Titular y domicilio o correo electrónico para comunicar la respuesta.</li>
              <li>Documentos que acrediten la identidad.</li>
              <li>La descripción clara y precisa de los datos personales afectados.</li>
            </ul>
            <p className="mt-4">
               El Titular podrá enviar su solicitud a través de los canales de comunicación oficiales de Coparmex Sonora Norte (correo electrónico o en las oficinas del Centro Empresarial). Se emitirá respuesta en los plazos establecidos por la Ley (máximo de 20 días hábiles).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">5. Cambios al Aviso de Privacidad</h2>
            <p>
              COPARMEX SONORA NORTE se reserva el derecho de hacer cambios discrecionalmente al presente Aviso de Privacidad para adaptarlo a novedades legislativas o jurisprudenciales. Estas modificaciones estarán disponibles de forma inmediata en este sitio web.
            </p>
          </section>

          <section className="pt-8 border-t border-white/5">
            <p className="text-xs text-white/40 italic">
              Última actualización: 05 de Abril, 2026. <br />
              CENTRO EMPRESARIAL DEL NORTE DE SONORA S.P.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
