import React from "react";
import { Card } from "../app/ui";

export default function LegalPage() {
  return (
    <div className="space-y-4">
      <div className="text-3xl font-extrabold">Aviso legal y condiciones de uso</div>
      <div className="text-slate-400 text-sm">
        Última actualización: {new Date().getFullYear()}
      </div>

      <Card className="space-y-4 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold mb-1">1. Titular del sitio web</h2>
          <p>
            La presente aplicación web, denominada <strong>Quiniela Pro</strong>, es un proyecto
            personal desarrollado y gestionado por <strong>Javier Zafra del Moral</strong>.
          </p>
          <p className="mt-1">
            Correo de contacto: <strong>javierzafradelmoral@gmail.com</strong>
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">2. Objeto de la aplicación</h2>
          <p>
            Quiniela Pro es una herramienta para que el usuario pueda registrar y hacer un
            seguimiento de sus propias quinielas y resultados, así como consultar estadísticas
            personales y comparar resultados con amigos.
          </p>
          <p className="mt-1">
            Esta aplicación <strong>no vende, gestiona ni intermedia apuestas reales</strong>, ni
            está vinculada a <strong>Loterías y Apuestas del Estado</strong> ni a ningún otro
            organismo oficial. Cualquier boleto de quiniela deberá ser jugado exclusivamente a
            través de los canales oficiales correspondientes.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">3. Condiciones de uso</h2>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>El usuario se compromete a hacer un uso responsable y lícito de la aplicación.</li>
            <li>
              No está permitido utilizar la plataforma para actividades fraudulentas, para
              difundir contenido ilegal o para intentar acceder a datos de otros usuarios.
            </li>
            <li>
              El acceso a la aplicación está dirigido exclusivamente a personas mayores de 18 años.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold mb-1">4. Exención de responsabilidad</h2>
          <p>
            El titular no garantiza la exactitud de los resultados ni de los cálculos mostrados,
            aunque se esfuerza por que sean correctos. La información mostrada tiene únicamente
            carácter informativo y de entretenimiento y <strong>no debe considerarse asesoramiento
            profesional en materia de apuestas</strong>.
          </p>
          <p className="mt-1">
            El titular no se hace responsable de las decisiones que el usuario pueda tomar al
            participar en apuestas reales fuera de esta plataforma, ni de los daños o pérdidas
            derivados de dichas decisiones.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">5. Propiedad intelectual</h2>
          <p>
            El código fuente, diseño y elementos visuales de Quiniela Pro pertenecen a su
            desarrollador, salvo aquellos elementos (iconos, tipografías, etc.) que estén sujetos
            a licencias de terceros. Queda prohibida la reproducción total o parcial de la
            aplicación sin autorización expresa.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">6. Enlaces externos</h2>
          <p>
            La aplicación puede incluir enlaces a sitios web de terceros. El titular no se
            responsabiliza del contenido ni de las políticas de privacidad de dichos sitios
            externos.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">7. Legislación aplicable</h2>
          <p>
            El uso de esta aplicación se rige por la legislación española. Cualquier conflicto se
            someterá a los juzgados y tribunales que resulten competentes según la normativa
            vigente.
          </p>
        </section>
      </Card>
    </div>
  );
}
