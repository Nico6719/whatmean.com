<template>
  <button class="liquid-glass-btn" :class="{ 'liquid-glass-btn-hover': hoverEffect }">
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'LiquidGlassButton',
  props: {
    hoverEffect: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>
.liquid-glass-btn {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.liquid-glass-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255,255,255,0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.liquid-glass-btn-hover:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.liquid-glass-btn-hover:hover::before {
  opacity: 1;
}
</style>