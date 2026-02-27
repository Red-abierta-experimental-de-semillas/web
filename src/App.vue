<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import CookiesModal from '@/components/modals/CookiesModal.vue'
import { useUsersStore } from '@/stores/users'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import NotificationToasts from '@/components/NotificationToasts.vue'
import { useProjectStore } from '@/stores/project'


const userStore = useUsersStore()
const projectStore = useProjectStore()

projectStore.fetch()

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      getAuth(),
      (user) => {
        unsubscribe()
        if (user) userStore.fetchCurrentUser(user.uid)
        resolve(user)
      },
      reject
    )
  })
}
getCurrentUser()

</script>
<template>
  <AppHeader />
  <RouterView style="margin-top: 60px" class="mb-5" />
  <AppFooter />
  <CookiesModal />
  <NotificationToasts />
</template>

<style scoped></style>
