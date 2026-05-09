<script setup lang="ts">
import {RouterLink} from 'vue-router'
</script>

<template>
  <footer class="raes-footer d-print-none">
    <div class="raes-shell footer-grid">
      <div>
        <RouterLink :to="{ name: 'home' }" class="footer-brand">Red Abierta Experimental de Semillas</RouterLink>
        <p>© 2025 · Investigación agrícola abierta y colaborativa.</p>
      </div>
      <nav class="footer-links" aria-label="Enlaces legales">
        <RouterLink :to="{ name: 'home' }">Inicio</RouterLink>
        <RouterLink :to="{ name: 'cookies-policy' }">Cookies</RouterLink>
        <RouterLink :to="{ name: 'privacy-policy' }">Privacidad</RouterLink>
        <RouterLink :to="{ name: 'terms-of-service' }">Términos</RouterLink>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.raes-footer {
  margin-top: 2rem;
  padding: 2.2rem 0;
  border-top: 1px solid rgba(47, 107, 63, 0.12);
  background: rgba(255, 250, 240, 0.55);
  backdrop-filter: blur(16px);
}

.footer-grid {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  justify-content: space-between;
}

.footer-brand {
  color: var(--raes-ink);
  font-weight: 950;
  text-decoration: none;
}

p {
  margin: 0.35rem 0 0;
  color: var(--raes-muted);
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-content: flex-end;
}

.footer-links a {
  padding: 0.5rem 0.7rem;
  color: var(--raes-muted);
  font-weight: 800;
  text-decoration: none;
  border-radius: 999px;
}

.footer-links a:hover {
  color: var(--raes-green-dark);
  background: rgba(232, 243, 220, 0.78);
}

@media (max-width: 767.98px) {
  .footer-grid {
    align-items: flex-start;
    flex-direction: column;
  }

  .footer-links {
    justify-content: flex-start;
  }
}
</style>
