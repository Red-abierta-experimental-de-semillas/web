<template>
  <main class="raes-shell involved-page">
    <span class="eyebrow">Cómo involucrarte</span>
    <h1>Hay muchas formas de ayudar a que las semillas circulen.</h1>
    <div class="involved-grid">
      <RouterLink :to="{ name: 'project-new' }" class="involved-card">
        <i class="bi bi-plus-circle"></i>
        <h2>Crear un proyecto</h2>
        <p>Propón un cultivo, una pregunta o una variedad que quieras recuperar, multiplicar o mejorar.</p>
      </RouterLink>
      <RouterLink :to="{ name: 'home', hash: '#projects' }" class="involved-card">
        <i class="bi bi-flower1"></i>
        <h2>Participar cultivando</h2>
        <p>Únete a proyectos abiertos, cultiva siguiendo la pauta y comparte semillas o resultados.</p>
      </RouterLink>
      <RouterLink :to="{ name: 'forum-index' }" class="involved-card">
        <i class="bi bi-chat-square-text"></i>
        <h2>Participar en los foros</h2>
        <p>Resuelve dudas, enseña avances, coordina intercambios y busca gente para nuevas ideas.</p>
      </RouterLink>
      <a href="mailto:redexperimentaldesemillas@gmail.com" class="involved-card">
        <i class="bi bi-envelope"></i>
        <h2>Proponer cosas</h2>
        <p>Escribe si quieres colaborar, organizar un evento, aportar recursos o sugerir una línea de trabajo.</p>
      </a>
    </div>
  </main>
</template>

<style scoped>
.involved-page { padding-bottom: 3rem; }
.eyebrow { color: var(--raes-green-dark); font-size: 0.72rem; font-weight: 850; letter-spacing: 0.11em; text-transform: uppercase; }
h1 { max-width: 850px; margin: 0.75rem 0 1.5rem; font-size: clamp(2rem, 5vw, 3.4rem); line-height: 1; font-weight: 900; }
.involved-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.involved-card { padding: 1.15rem; color: inherit; text-decoration: none; border: 1px solid rgba(47,107,63,.12); border-radius: 1rem; background: rgba(255,255,255,.6); }
.involved-card i { color: var(--raes-green-dark); font-size: 1.7rem; }
.involved-card h2 { margin: .65rem 0 .35rem; font-size: 1.15rem; font-weight: 900; }
.involved-card p { margin: 0; color: var(--raes-muted); font-size: .96rem; line-height: 1.5; }
@media (max-width: 767.98px) { .involved-grid { grid-template-columns: 1fr; } h1 { font-size: 2rem; } }
</style>
