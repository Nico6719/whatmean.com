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
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-right: 1px solid rgba(255, 255, 255, 0.18);
  height: 100vh;
  position: sticky;
  top: 0;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
}

.nav-link.active {
  background-color: rgba(13, 110, 253, 0.8) !important;
  box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
  transform: translateY(-2px);
}

.nav-link:not(.active) {
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.nav-link:not(.active):hover {
  background-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.nav-link {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}
</style>