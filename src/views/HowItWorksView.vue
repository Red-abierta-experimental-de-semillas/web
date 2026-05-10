<template>
  <main class="raes-shell how-page">
    <RouterLink :to="{ name: 'home' }" class="back-link">
      <i class="bi bi-arrow-left"></i> Volver a proyectos
    </RouterLink>

    <section class="how-hero glass-panel">
      <span class="eyebrow">Cómo funciona RAES</span>
      <h1>De una idea a un ensayo compartido.</h1>
      <p>
        La Red Abierta Experimental de semillas conecta a personas que quieren probar, conservar, mejorar y compartir semillas en condiciones reales.
      </p>
    </section>

    <section class="process-grid">
      <article>
        <span>1</span>
        <h2>Encuentra un proyecto</h2>
        <p>Busca por cultivo, zona o tema. Cada proyecto explica qué se quiere probar y qué tipo de ayuda necesita.</p>
      </article>
      <article>
        <span>2</span>
        <h2>Pide unirte</h2>
        <p>Envía una solicitud al creador. Participar puede significar aportar semillas, recibirlas o ayudar a multiplicarlas.</p>
      </article>
      <article>
        <span>3</span>
        <h2>Cultiva, observa y guarda semillas</h2>
        <p>Participa desde tu huerto, finca, terraza o asociación. Observa bien y conserva semillas cuando el proyecto lo plantee.</p>
      </article>
      <article>
        <span>4</span>
        <h2>Comparte semillas y resultados</h2>
        <p>Usa el foro para avances, dudas y conclusiones. Y cuando toque, comparte semillas para que el proyecto siga vivo.</p>
      </article>
    </section>

    <section class="cta-panel glass-panel">
      <div>
        <span class="eyebrow">Empieza ahora</span>
        <h2>Busca un proyecto abierto, comparte semillas o publica el tuyo.</h2>
      </div>
      <div class="cta-actions">
        <RouterLink :to="{ name: 'home', hash: '#projects' }" class="btn btn-primary btn-lg">Ver proyectos</RouterLink>
        <RouterLink :to="{ name: 'project-new' }" class="btn btn-outline-primary btn-lg">Crear proyecto</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.how-page {
  padding-top: 1rem;
  padding-bottom: 3rem;
}

.back-link {
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  margin-bottom: 1rem;
  color: var(--raes-green-dark);
  font-weight: 900;
  text-decoration: none;
}

.eyebrow {
  color: var(--raes-green-dark);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.how-hero {
  padding: clamp(1.5rem, 5vw, 3rem);
  border-radius: 2rem;
}

.how-hero h1 {
  max-width: 850px;
  margin: 0.6rem 0 1rem;
  font-size: clamp(2.4rem, 8vw, 5.4rem);
  line-height: 0.95;
  font-weight: 950;
}

.how-hero p {
  max-width: 720px;
  color: var(--raes-muted);
  font-size: clamp(1.05rem, 2vw, 1.25rem);
}

.process-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.process-grid article,
.cta-panel {
  padding: 1.25rem;
  border: 1px solid rgba(47, 107, 63, 0.12);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.72);
}

.process-grid span {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  margin-bottom: 1rem;
  color: #fff;
  font-weight: 950;
  border-radius: 999px;
  background: var(--raes-green-dark);
}

.process-grid h2,
.cta-panel h2 {
  font-weight: 950;
}

.process-grid p {
  color: var(--raes-muted);
}

.cta-panel {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.cta-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .process-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .process-grid,
  .cta-panel {
    grid-template-columns: 1fr;
    display: grid;
  }

  .cta-actions .btn {
    width: 100%;
  }
}
</style>
