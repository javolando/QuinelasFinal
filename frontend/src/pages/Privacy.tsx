import React from "react";
import { Card } from "../app/ui";

export default function PrivacyPage() {
  return (
    <div className="space-y-4">
      <div className="text-3xl font-extrabold">Política de privacidad</div>
      <div className="text-slate-400 text-sm">
        Última actualización: {new Date().getFullYear()}
      </div>

      <Card className="space-y-4 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold mb-1">1. Responsable del tratamiento</h2>
          <p>
            El responsable del tratamiento de los datos personales recogidos a través de
            esta aplicación es <strong>Javier Zafra del Moral</strong> (en adelante, “el Responsable”).
          </p>
          <p className="mt-1">
            Correo de contacto: <strong>javierzafradelmoral@gmail.com</strong>
            <br />
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">2. Datos personales que se tratan</h2>
          <p>En Quiniela Pro se tratan únicamente los siguientes datos:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Correo electrónico.</li>
            <li>Nombre que el usuario indica al registrarse.</li>
            <li>
              Datos de uso de la aplicación: quinielas registradas, resultados, estadísticas
              personales y amigos añadidos.
            </li>
          </ul>
          <p className="mt-1">
            No se tratan categorías especiales de datos (salud, ideología, etc.).
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">3. Finalidad del tratamiento</h2>
          <p>Los datos se utilizan con estas finalidades:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Permitir el registro e inicio de sesión del usuario.</li>
            <li>Guardar y mostrar las quinielas, aciertos y estadísticas personales.</li>
            <li>Gestionar el sistema de amigos y rankings dentro de la aplicación.</li>
            <li>Atender consultas o incidencias que el usuario pueda plantear.</li>
          </ul>
          <p className="mt-1">
            Quiniela Pro es únicamente una herramienta de seguimiento y análisis de quinielas.
            No realiza ni intermedia en apuestas reales.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">4. Base jurídica</h2>
          <p>La base legal para tratar los datos es:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>
              <strong>Ejecución de un contrato</strong>: la cuenta de usuario y las funciones
              de la aplicación requieren tratar los datos indicados.
            </li>
            <li>
              <strong>Consentimiento</strong>: cuando el usuario decide libremente registrarse
              y utilizar la plataforma.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold mb-1">5. Destinatarios de los datos</h2>
          <p>
            Los datos no se ceden a terceros, salvo obligación legal. Se utilizan únicamente
            proveedores técnicos necesarios para el funcionamiento de la aplicación
            (por ejemplo, servicios de alojamiento y bases de datos), con los que el Responsable
            mantiene los contratos de encargo de tratamiento exigidos por el RGPD.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">6. Plazo de conservación</h2>
          <p>
            Los datos se conservan mientras la cuenta del usuario permanezca activa. El usuario
            puede solicitar la eliminación de su cuenta y de sus datos en cualquier momento,
            enviando un correo a la dirección indicada en el apartado 1.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">7. Derechos de los usuarios</h2>
          <p>
            El usuario puede ejercer sus derechos de acceso, rectificación, supresión, oposición,
            limitación del tratamiento y portabilidad enviando un correo electrónico a
            <strong> contacto@tudominio.com</strong> (sustituir por la dirección real), indicando
            el derecho que desea ejercer y adjuntando una prueba de identidad.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">8. Seguridad</h2>
          <p>
            El Responsable aplica medidas técnicas y organizativas razonables para proteger los
            datos personales, tales como el uso de contraseñas cifradas mediante algoritmos
            de hash robustos y la limitación de acceso a la base de datos.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">9. Menores de edad</h2>
          <p>
            El uso de Quiniela Pro está dirigido a personas mayores de 18 años. Si se detecta
            que un menor ha creado una cuenta, se procederá a su eliminación.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">10. Cambios en esta política</h2>
          <p>
            El Responsable se reserva el derecho a modificar esta política de privacidad para
            adaptarla a cambios legislativos o de funcionamiento de la aplicación. Las versiones
            actualizadas se publicarán en esta misma página.
          </p>
        </section>
      </Card>
    </div>
  );
}
