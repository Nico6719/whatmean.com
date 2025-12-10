<template>
  <footer class="glass-footer">
    <div class="container-fluid px-4 px-md-5">
      <div class="row">
        <div class="col-lg-4 mb-4 mb-lg-0">
          <h3 class="h5 fw-bold text-white">何意味.com</h3>
          <p class="text-white-50">
            记录和分享最新的网络热词和流行文化，帮助大家更好地理解和融入当代网络环境。
          </p>
        </div>
        
        <div class="col-lg-2 col-md-4 mb-4 mb-md-0">
          <h4 class="h6 fw-bold text-uppercase text-primary mb-3">快速链接</h4>
          <ul class="list-unstyled">
            <li class="mb-2"><a href="#" class="text-decoration-none text-white-50">首页</a></li>
            <li class="mb-2"><a href="#" class="text-decoration-none text-white-50">最新热梗</a></li>
            <li class="mb-2"><a href="#" class="text-decoration-none text-white-50">热门排行</a></li>
            <li class="mb-2"><a href="#" class="text-decoration-none text-white-50">分类浏览</a></li>
          </ul>
        </div>
        
        <div class="col-lg-2 col-md-4 mb-4 mb-md-0">
          <h4 class="h6 fw-bold text-uppercase text-primary mb-3">关于我们</h4>
          <ul class="list-unstyled">
            <li class="mb-2"><a href="/about" class="text-decoration-none text-white-50">关于我们</a></li>
            <li class="mb-2"><a href="#" class="text-decoration-none text-white-50">贡献内容</a></li>
            <li class="mb-2"><a href="#" class="text-decoration-none text-white-50">广告合作</a></li>
            <li class="mb-2"><a href="#" class="text-decoration-none text-white-50">加入我们</a></li>
          </ul>
        </div>
        
        <div class="col-lg-4 col-md-4">
          <h4 class="h6 fw-bold text-uppercase text-white mb-3">订阅更新</h4>
          <p class="text-white-50">订阅获取最新热梗推送</p>
          <div class="input-group mb-3 glass-input-group">
            <input type="email" class="form-control" placeholder="您的邮箱地址" aria-label="您的邮箱地址">
            <button class="btn btn-primary" type="button">订阅</button>
          </div>
          <p class="text-muted small">我们承诺保护您的隐私，不会发送垃圾邮件。</p>
        </div>
      </div>
      
      <hr class="my-4">
      
      <div class="row align-items-center">
        <div class="col-md-6 text-center text-md-start">
          <p class="mb-0 text-white-50">&copy; 2025 何意味.com. 保留所有权利.</p>
        </div>
        <div class="col-md-6 text-center text-md-end">
          <ul class="list-inline mb-0">
            <li class="list-inline-item"><a href="#" class="text-white-50 text-decoration-none">隐私政策</a></li>
            <li class="list-inline-item"><a href="#" class="text-white-50 text-decoration-none">使用条款</a></li>
            <li class="list-inline-item"><a href="#" class="text-white-50 text-decoration-none">网站地图</a></li>
          </ul>
        </div>
      </div>
      
      <!-- 备案号区域 -->
      <div class="row mt-4">
        <div class="col-12 text-center">
          <p class="mb-0 text-white-50 small">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" class="text-decoration-none text-white-50">
              闽ICP备2025115232号-2
            </a>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.glass-footer {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  padding: 2rem 0;
}

a.text-muted:hover {
  color: #0d6efd !important;
}

.social-links a:hover {
  color: #0d6efd !important;
  transform: translateY(-3px);
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
}

.glass-input-group {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 4px;
}

.glass-input-group .form-control {
  background: transparent;
  border: none;
  border-radius: 8px;
  color: white;
}

.glass-input-group .form-control::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.glass-input-group .form-control:focus {
  box-shadow: none;
  background: transparent;
}

.glass-input-group .btn {
  border-radius: 8px;
}

.h6.fw-bold {
  letter-spacing: 1px;
}

footer {
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .glass-input-group {
    max-width: 100%;
  }
}
</style>