<script setup lang="ts">
import { useUsersStore } from "@/stores/users";
import {useRouter} from "vue-router";
import { ref, computed } from "vue";

const router = useRouter()
const store = useUsersStore()

const email = ref("")
const password = ref("")
type ViewMode = 'login' | 'register' | 'reset'
const viewMode = ref<ViewMode>('login')
const errorMsg = ref("")
const successMsg = ref("")

const closeModal = () => {
  const element = document.getElementById('closeLoginModalButton')
  if (element) element.click()
}

const signInWithGoogle = () => {
  errorMsg.value = ""
  successMsg.value = ""
  store.signInWithGoogle().then(() => {
    router.push("/")
  }).finally(() => {
    closeModal()
  })
}

const handleEmailAuth = async () => {
  errorMsg.value = ""
  successMsg.value = ""
  
  if (!email.value || (viewMode.value !== 'reset' && !password.value)) {
    errorMsg.value = "Hacen falta datos para continuar."
    return
  }
  
  try {
    if (viewMode.value === 'register') {
      await store.registerWithEmail(email.value, password.value)
      successMsg.value = "¡Cuenta creada! Revisa tu bandeja de entrada para verificar tu correo antes de iniciar sesión."
      viewMode.value = 'login'
      password.value = ""
    } else if (viewMode.value === 'reset') {
      await store.resetPassword(email.value)
      successMsg.value = "Te hemos enviado un correo para restablecer la contraseña."
      viewMode.value = 'login'
    } else {
      await store.signInWithEmail(email.value, password.value)
      router.push("/")
      closeModal()
    }
  } catch (e: any) {
    if (e.message === 'email-not-verified') {
      errorMsg.value = "Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada."
    } else if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
      errorMsg.value = "Email o contraseña incorrectos"
    } else if (e.code === 'auth/email-already-in-use') {
      errorMsg.value = "El email ya está en uso"
    } else if (e.code === 'auth/weak-password') {
      errorMsg.value = "La contraseña debe tener al menos 6 caracteres"
    } else if (e.code === 'auth/too-many-requests') {
      errorMsg.value = "Demasiados intentos de inicio de sesión fallidos. Inténtalo de nuevo más tarde."
    } else {
      errorMsg.value = "Error de autenticación. Inténtalo de nuevo."
    }
  }
}

const modalTitle = computed(() => {
  if (viewMode.value === 'register') return 'Crear cuenta'
  if (viewMode.value === 'reset') return 'Recuperar contraseña'
  return 'Iniciar sesión'
})
</script>

<template>
  <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModal" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="loginModalLabel">{{ modalTitle }}</h1>
          <button id="closeLoginModalButton" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p class="text-muted small">Al continuar, aceptas nuestro <router-link to="/terms-of-service" @click="closeModal">Acuerdo de usuario</router-link> y confirmas que has entendido la <router-link to="/privacy-policy" @click="closeModal">Política de privacidad</router-link>.</p>
          
          <div v-if="successMsg" class="alert alert-success py-2" role="alert">
            {{ successMsg }}
          </div>

          <div v-if="errorMsg" class="alert alert-danger py-2" role="alert">
            {{ errorMsg }}
          </div>

          <form @submit.prevent="handleEmailAuth" class="mb-4">
            <div class="mb-3">
              <label for="emailInput" class="form-label">Email</label>
              <input type="email" class="form-control" id="emailInput" v-model="email" required>
            </div>
            <div class="mb-3" v-if="viewMode !== 'reset'">
              <div class="d-flex justify-content-between">
                <label for="passwordInput" class="form-label">Contraseña</label>
                <a href="#" class="text-secondary small text-decoration-none" v-if="viewMode === 'login'" @click.prevent="viewMode = 'reset'">¿Olvidaste tu contraseña?</a>
              </div>
              <input type="password" class="form-control" id="passwordInput" v-model="password" required minlength="6">
            </div>
            <div class="d-grid mt-4">
              <button type="submit" class="btn btn-primary">
                {{ viewMode === 'register' ? 'Registrarse' : (viewMode === 'reset' ? 'Enviar enlace' : 'Iniciar sesión') }}
              </button>
            </div>
          </form>

          <div class="text-center mb-4">
            <a href="#" class="text-decoration-none" v-if="viewMode === 'login'" @click.prevent="viewMode = 'register'">
              ¿No tienes cuenta? Regístrate
            </a>
            <a href="#" class="text-decoration-none" v-else @click.prevent="viewMode = 'login'">
              ¿Ya tienes cuenta? Inicia sesión
            </a>
          </div>

          <div v-if="viewMode !== 'reset'">
            <hr class="my-4">
            <div class="d-grid gap-2">
              <button class="btn btn-outline-secondary" type="button" @click="signInWithGoogle">
                <i class="bi bi-google me-1"></i> Continuar con Google
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>