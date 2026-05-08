<template>
  <div class="skeleton-card mb-3 p-3 rounded-4 border bg-body shadow-sm">
    <div class="d-flex align-items-center gap-3 mb-3">
      <BaseSkeleton variant="avatar" />
      <div class="flex-grow-1">
        <BaseSkeleton variant="text" width="60%" />
        <BaseSkeleton variant="text" width="40%" />
      </div>
    </div>
    <div class="mb-3">
      <BaseSkeleton variant="text" width="100%" />
      <BaseSkeleton variant="text" width="85%" />
    </div>
    <div class="d-flex justify-content-between mt-auto pt-3 border-top">
      <BaseSkeleton variant="button" width="32px" height="32px" />
      <BaseSkeleton variant="button" width="80px" height="32px" />
    </div>
  </div>
</template>

<script setup>
import BaseSkeleton from './BaseSkeleton.vue';
</script>

<style scoped>
.skeleton-card {
  min-height: 160px;
  border-color: var(--border-color) !important;
}
</style>