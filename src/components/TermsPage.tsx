import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import SEO from './SEO';

interface TermsPageProps {
  onBack: () => void;
}

export default function TermsPage({ onBack }: TermsPageProps) {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-slate-300">
      <SEO title="Términos y Condiciones | Encuentro Jóvenes Coparmex" path="/legal/terminos" />
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
            <ShieldCheck className="text-branding-orange w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
            Términos y <span className="text-branding-orange">Condiciones</span>
          </h1>
        </div>

        <div className="space-y-8 text-sm md:text-base leading-relaxed opacity-90 font-medium">
          <section>
            <p>
              Bienvenido al sitio web del evento "Encuentro Jóvenes Coparmex". Lea estos términos detenidamente antes de adquirir su carnet a través de nuestro sitio web y/o antes de hacer uso de nuestros servicios en general. Al iniciar el uso de este sitio o ante la contratación de nuestros servicios, se presume que usted ha leído y consentido estos términos y condiciones. Al utilizar este sitio electrónicamente o cualquiera de nuestros servicios, el Usuario reconoce que ha leído y aceptado sujetarse por estos términos y condiciones en toda su extensión y con todo su alcance legal.
            </p>
            <p className="mt-4">
              Los siguientes términos y condiciones para el uso del portal (las “Reglas de Uso”) son aplicables al sitio web del evento, propiedad del **CENTRO EMPRESARIAL DEL NORTE DE SONORA S.P.** (“COPARMEX SONORA NORTE”), con domicilio fiscal en: **Blvd. Antonio Quiroga 108, Fracc. Real de Quiroga, C.P. 83224, Hermosillo, Sonora, México.**
            </p>
            <p className="mt-4">
              Para efectos de las presentes Reglas de Uso del Portal, se considerará usuario al: (i) público en general y/o (ii) cliente o afiliado que haya adquirido un carnet de acceso a través de nuestro Portal (el “Usuario”). El Usuario acepta plena e incondicionalmente tanto las Reglas de Uso del Portal, como el Aviso de Privacidad (conjuntamente, el “Aviso Legal”). COPARMEX SONORA NORTE se reserva el derecho de actualizar o revisar estos términos sin previo aviso; revise estos términos periódicamente para enterarse de cualesquier cambios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">1. Sobre COPARMEX y los Servicios</h2>
            <p>
              COPARMEX SONORA NORTE es una institución de interés público, constituida como persona moral sin fines de lucro, enfocada en agrupar, representar y defender los intereses de los empresarios en el Norte de Sonora. A través de este portal, se facilita la venta de accesos (carnets) para el "Encuentro Jóvenes Coparmex" (los “Servicios”). 
            </p>
            <p className="mt-4">
              El material contenido en el Portal es para fines informativos del evento. Estas Reglas de Uso rigen la utilización del Portal y su acceso constituye un contrato vinculante. En caso de que el Usuario no esté de acuerdo con el Aviso Legal, en todo o en parte, deberá abstenerse de utilizar el Portal o adquirir los carnets.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">2. Conducta del Usuario</h2>
            <p>
              El Usuario acepta cumplir todas las leyes locales, estatales y nacionales pertinentes y es el único responsable por las acciones u omisiones que ocurran como consecuencia del uso o acceso al Portal. Queda expresamente prohibido:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
              <li>Usar el Portal en relación con la comisión de delitos patrimoniales o de cualquier otro tipo.</li>
              <li>Recopilar o diseminar información acerca de terceros sin consentimiento.</li>
              <li>Crear identidades falsas o intentar engañar sobre el origen de un mensaje o pago.</li>
              <li>Interferir o perturbar el funcionamiento de la red o plataforma de venta de carnets.</li>
              <li>Intentar obtener acceso no autorizado a los sistemas de administración del evento.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">3. Adquisición de Carnets, Cancelaciones y Devoluciones</h2>
            <p>
              Los carnets o accesos al evento son personales e intransferibles. El Usuario se obliga a cumplir con el pago del carnet elegido en el Portal. El acceso y código QR de entrada no será enviado o validado hasta que el pago haya sido confirmado por COPARMEX SONORA NORTE.
            </p>
            <p className="mt-4">
              Al proporcionar voluntariamente el Usuario información sobre su tarjeta de crédito o débito para la adquisición del carnet, el Usuario consiente su uso para el cargo correspondiente, y confirma que la tarjeta es suya.
            </p>
            <p className="mt-4">
              La venta de carnets es definitiva. No procederán devoluciones o reembolsos por inasistencia al evento o cambios en la agenda del mismo. Solo procederán reembolsos excepcionales en caso de que el evento sea cancelado temporal o definitivamente por parte de COPARMEX SONORA NORTE. Las políticas de cancelación y reembolso en dichos escenarios excepcionales estarán determinadas única y exclusivamente por los organizadores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">4. Propiedad Intelectual</h2>
            <p>
              COPARMEX SONORA NORTE cuenta con la titularidad y/o autorización de uso exclusiva de derechos para todas las marcas, avisos comerciales, logotipos, diseños y contenidos informativos mostrados en el Portal relativos al Encuentro de Jóvenes Coparmex.
            </p>
            <p className="mt-4">
              No se concede ninguna licencia o autorización de uso de ninguna clase sobre esta Propiedad Intelectual. El Usuario se obliga a respetar en todo momento dichos derechos y no podrá modificar, copiar o reproducir de manera parcial o total el contenido del Portal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">5. Terceros y Plataformas de Pago</h2>
            <p>
              <strong>Las transacciones serán efectuadas mediante la pasarela de Openpay.</strong> Para el procesamiento de pagos mediante tarjeta de crédito, débito y otros métodos electrónicos, el Portal utiliza los servicios de esta plataforma. Openpay es independiente de COPARMEX SONORA NORTE y su finalidad es facilitar transacciones seguras bajo estándares internacionales de seguridad (PCI DSS).
            </p>
            <p className="mt-4">
              COPARMEX no asume responsabilidad derivada del funcionamiento exclusivo de las plataformas de pagos o pasarelas transaccionales ajenas. El Usuario acepta sujetarse a los términos y condiciones propios de OpenPay al momento de realizar su pago.
            </p>
            <p className="mt-4">
              Asimismo, la existencia de enlaces a sitios de terceros, patrocinadores o aliados estratégicos en el Portal no constituye una responsabilidad directa de COPARMEX SONORA NORTE respecto a su contenido, operaciones o políticas.
            </p>
          </section>

           <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">6. Limitación de Responsabilidad</h2>
            <p>
              COPARMEX SONORA NORTE no garantiza que las funciones contenidas en el Portal estarán libres de interrupciones o errores, o que los defectos se corregirán de manera inmediata. Se excluye de responsabilidad por interrupciones en la venta de carnets ocasionadas por fallas masivas de red, caídas de servidores de terceros o fuerza mayor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">8. Uso de Imagen y Registro Audiovisual</h2>
            <p>
              Al adquirir el carnet y asistir al evento, el Usuario reconoce y acepta que COPARMEX SONORA NORTE o terceros autorizados realizarán registros audiovisuales (fotografía y video) del evento para su difusión masiva en medios digitales, impresos y redes sociales corporativas. 
            </p>
            <p className="mt-4">
              El Usuario autoriza de manera gratuita e indefinida el uso de su imagen (rostro, voz y semblante) únicamente en el contexto de la promoción del "Encuentro". En caso de que el Usuario desee solicitar el retiro de alguna imagen específica donde aparezca de forma identificable, podrá contactar a los organizadores a través de los canales de comunicación oficiales brindados en el Portal.
            </p>
          </section>

          <section className="pt-8 border-t border-white/5">
            <p className="text-xs text-white/40 italic">
              Última actualización: 08 de Abril, 2026. <br />
              CENTRO EMPRESARIAL DEL NORTE DE SONORA S.P. (CEN811214EKA) <br />
              Hermosillo, Sonora.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
