<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  window.scrollTo(0, 0);
});
</script>

<template>
  <div class="container my-5" style="max-width: 800px;">
    <h1 class="mb-4">Acuerdo de Usuario (Términos de Servicio)</h1>
    <p class="text-muted">Última actualización: <strong>Octubre 2026</strong></p>

    <div class="mt-4">
      <p>Bienvenido a <strong>RAES (Red Abierta Experimental de Semillas)</strong>. Al acceder o utilizar nuestra plataforma, aceptas estos Términos de Servicio ("Acuerdo"). Si no estás de acuerdo con alguna parte, por favor no utilices RAES.</p>

      <h3 class="mt-4">1. Naturaleza del Proyecto</h3>
      <p>RAES es una plataforma colaborativa y de código abierto sin ánimo de lucro diseñada para conectar a personas interesadas en la experimentación, mejora vegetal, conservación y agroecología. La plataforma se proporciona "tal cual" (as-is), sin garantías de ningún tipo.</p>

      <h3 class="mt-4">2. Uso Aceptable y Conducta</h3>
      <p>Como usuario de RAES, te comprometes a:</p>
      <ul>
        <li>No utilizar la plataforma para actividades ilegales.</li>
        <li>No compartir contenido ofensivo, discriminatorio o que promueva el odio.</li>
        <li>Respetar la propiedad intelectual de otros. Cualquier información que compartas sobre semillas o proyectos debe ser de tu propiedad o estar libre de restricciones (Open Source Seed Pledge).</li>
        <li>Mantener un trato respetuoso en los foros y discusiones.</li>
        <li>No utilizar las herramientas de comunicación o los foros para realizar SPAM o envíos comerciales masivos no solicitados.</li>
      </ul>
      <p>Nos reservamos el derecho de eliminar contenido o suspender cuentas que violen estas normas básicas de convivencia comunitaria.</p>

      <h3 class="mt-4">3. Cuentas y Seguridad</h3>
      <p>Para crear proyectos o participar en los foros de determinados grupos, deberás crear una cuenta con tu correo electrónico o mediante Google. Eres responsable de mantener la confidencialidad de tu acceso. Si detectas cualquier uso no autorizado, deberás cambiar tu contraseña u optimizar tu seguridad.</p>

      <h3 class="mt-4">4. Contenido Generado por el Usuario</h3>
      <p>Todo el contenido que publicas en RAES (texto en foros, imágenes de proyectos, etc.) sigue siendo de tu propiedad. Al subirlo, otorgas a RAES una licencia no exclusiva, mundial y libre de regalías para alojarlo y mostrarlo.</p>
      <p>Entiendes que la información es compartida bajo tu propio riesgo y RAES no se hace responsable de las opiniones o datos proporcionados por otros miembros.</p>

      <h3 class="mt-4">5. Limitación de Responsabilidad</h3>
      <p>Dado que RAES es un proyecto experimental colaborativo:</p>
      <ul>
        <li>No nos hacemos responsables de posibles fallos técnicos, pérdida de datos almacenados en tu perfil, o caídas temporales del servidor.</li>
        <li>No mediamos, ni nos responsabilizamos de disputas que surjan durante el intercambio de semillas o voluntariados entre usuarios en la vida real. Siempre recomendamos emplear el sentido común.</li>
      </ul>

      <h3 class="mt-4">6. Modificaciones de estos Términos</h3>
      <p>Dado que el desarrollo de la plataforma es continuo, podemos modificar este acuerdo periódicamente. Notificaremos a los usuarios sobre cambios importantes, pero siempre podrás revisar la versión más actual en esta misma página.</p>
    </div>
  </div>
</template>
