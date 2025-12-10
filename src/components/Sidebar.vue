<template>
  <aside class="glass-sidebar">
    <div class="p-3">
      <h2 class="h5 mb-3">分类浏览</h2>
      <ul class="nav flex-column">
        <li class="nav-item mb-1">
          <a class="nav-link active bg-primary text-white rounded" href="#">全部热梗</a>
        </li>
        <li class="nav-item mb-1">
          <a class="nav-link text-white rounded" href="#">年度热词</a>
        </li>
        <li class="nav-item mb-1">
          <a class="nav-link text-white rounded" href="#">表情包</a>
        </li>
        <li class="nav-item mb-1">
          <a class="nav-link text-white rounded" href="#">网络用语</a>
        </li>
        <li class="nav-item mb-1">
          <a class="nav-link text-white rounded" href="#">流行语</a>
        </li>
        <li class="nav-item mb-1">
          <a class="nav-link text-white rounded" href="#">谐音梗</a>
        </li>
        <li class="nav-item mb-1">
          <a class="nav-link text-white rounded" href="#">影视梗</a>
        </li>
        <li class="nav-item mb-1">
          <a class="nav-link text-white rounded" href="#">游戏梗</a>
        </li>
      </ul>
      
    </div>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar'
}
</script>

<style scoped>
.glass-sidebar {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-right: 1px solid rgba(255, 255, 255, 0.18);
  height: 100vh;
  position: sticky;
  top: 0;
}

.nav-link.active {
  background-color: rgba(13, 110, 253, 0.8) !important;
}

.nav-link:not(.active) {
  background: rgba(255, 255, 255, 0.3);
}

.nav-link:not(.active):hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.nav-link {
  transition: all 0.3s ease;
}
</style>