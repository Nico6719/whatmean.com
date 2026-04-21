<template>
  <div class="liquid-glass-card" :class="{ 'liquid-glass-card-hover': hoverEffect }">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'LiquidGlassCard',
  props: {
    hoverEffect: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>
.liquid-glass-card {
  background: rgba(0, 0, 0, 0.30);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.liquid-glass-card-hover:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}
</style>
