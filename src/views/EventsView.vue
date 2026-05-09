<template>
  <main class="raes-shell events-page">
    <span class="eyebrow">Eventos</span>
    <h1>Eventos de la red</h1>
    <section class="empty-events">
      <i class="bi bi-calendar-event"></i>
      <h2>Aún no hay eventos publicados.</h2>
      <p>Este espacio podrá recoger encuentros, siembras colectivas, intercambios de semillas, talleres y sesiones online.</p>
      <RouterLink :to="{ name: 'get-involved' }" class="btn btn-primary">Proponer un evento</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.events-page { padding-bottom: 3rem; }
.eyebrow { color: var(--raes-green-dark); font-size: 0.72rem; font-weight: 850; letter-spacing: 0.11em; text-transform: uppercase; }
h1 { margin: .75rem 0 1.5rem; font-size: clamp(2rem, 5vw, 3.4rem); font-weight: 900; }
.empty-events { padding: 2rem; text-align: center; border: 1px solid rgba(47,107,63,.12); border-radius: 1rem; background: rgba(255,255,255,.6); }
.empty-events i { color: var(--raes-green-dark); font-size: 2.4rem; }
.empty-events h2 { margin: .75rem 0 .35rem; font-size: 1.25rem; font-weight: 900; }
.empty-events p { max-width: 680px; margin: 0 auto 1rem; color: var(--raes-muted); }
</style>
