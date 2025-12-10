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
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 
    0 8px 32px rgba(31, 38, 135, 0.1),
    inset 0 2px 8px rgba(255, 255, 255, 0.3),
    inset 0 -2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.liquid-glass-card::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.01));
  z-index: -1;
  border-radius: 30px;
  transition: all 0.4s ease;
}

.liquid-glass-card-hover:hover {
  transform: translateY(-10px) scale(1.03);
  box-shadow: 
    0 20px 50px rgba(31, 38, 135, 0.25),
    inset 0 2px 15px rgba(255, 255, 255, 0.5),
    inset 0 -2px 15px rgba(0, 0, 0, 0.1);
}

.liquid-glass-card-hover:hover::before {
  top: -18px;
  left: -18px;
  right: -18px;
  bottom: -18px;
}
</style>