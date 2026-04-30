<template>
  <NConfigProvider>
    <NMessageProvider>
      <NLayout>
        <!-- <HeaderBar v-if="authStore.isAuth" /> -->
        <NLayoutContent>
          <RouterView />
        </NLayoutContent>
      </NLayout>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth.store'

const authStore = useAuthStore()
</script>

<style>
body {
  padding: 0 20px;
}
</style>
