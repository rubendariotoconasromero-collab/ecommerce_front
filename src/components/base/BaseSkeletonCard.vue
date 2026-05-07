<template>
  <div class="skeleton-card animate-pulse mb-4 p-4 rounded-4 border bg-white shadow-sm">
    <div class="d-flex align-items-center gap-3 mb-3">
      <div class="skeleton-avatar"></div>
      <div class="flex-grow-1">
        <div class="skeleton-line w-50 mb-2"></div>
        <div class="skeleton-line w-25"></div>
      </div>
    </div>
    <div class="skeleton-line w-100 mb-2"></div>
    <div class="skeleton-line w-75 mb-3"></div>
    <div class="d-flex justify-content-between mt-auto pt-3 border-top">
      <div class="skeleton-btn"></div>
      <div class="skeleton-btn"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  min-height: 180px;
}
.skeleton-avatar {
  width: 45px;
  height: 45px;
  background: #f1f5f9;
  border-radius: 12px;
}
.skeleton-line {
  height: 12px;
  background: #f1f5f9;
  border-radius: 4px;
}
.skeleton-btn {
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border-radius: 8px;
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>