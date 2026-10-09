<template>
  <div class="relative h-dvh w-screen overflow-hidden">
    <!-- The page renders first: it only sets shared state, and SSR renders siblings in order. -->
    <NuxtPage />
    <WorldGlobe />
    <div class="vignette" aria-hidden="true" />
    <AtlasShell />
    <div class="grain" aria-hidden="true" />
  </div>
</template>
