<template>
  <tbody class="skeleton-table">
    <tr v-for="n in rows" :key="n">
      <td v-for="c in columns" :key="c" class="py-3 px-4">
        <div class="d-flex align-items-center gap-3" v-if="c === 1 && hasAvatar">
          <BaseSkeleton variant="avatar" width="34px" height="34px" />
          <div class="flex-grow-1">
            <BaseSkeleton variant="text" width="120px" />
            <BaseSkeleton variant="text" width="80px" />
          </div>
        </div>
        <BaseSkeleton v-else variant="text" :width="getRandomWidth()" />
      </td>
      <td class="text-end pe-4">
        <BaseSkeleton variant="button" class="ms-auto" />
      </td>
    </tr>
  </tbody>
</template>

<script setup>
import BaseSkeleton from './BaseSkeleton.vue';

defineProps({
  rows: {
    type: Number,
    default: 5
  },
  columns: {
    type: Number,
    default: 3
  },
  hasAvatar: {
    type: Boolean,
    default: true
  }
});

const getRandomWidth = () => {
  const widths = ['60px', '80px', '100px', '120px'];
  return widths[Math.floor(Math.random() * widths.length)];
};
</script>