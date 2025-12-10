<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="app-container">
    <!-- 网站头部 -->
    <Header />
    
    <div class="container-fluid flex-fill">
      <div class="row h-100">
        <!-- 主要内容区域 -->
        <div class="col-12">
          <router-view></router-view>
        </div>
      </div>
    </div>
    
    <!-- 网站底部 -->
    <Footer />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.container-fluid {
  padding: 0;
  flex: 1;
  max-width: 100%;
}

.row {
  flex: 1;
  margin: 0;
}

.col-12 {
  padding: 0;
}
</style>