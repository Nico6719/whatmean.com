<template>
  <main class="p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="h3">热门网络热梗</h2>
      <div>
        <button class="btn btn-outline-primary btn-sm me-2">最新</button>
        <button class="btn btn-outline-primary btn-sm">最热</button>
      </div>
    </div>
    
    <div class="row">
      <div class="col-lg-4 col-md-6 mb-4" v-for="meme in memes" :key="meme.id">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title h5">{{ meme.title }}</h3>
            <p class="card-text">{{ meme.description }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-white-50">{{ meme.category }}</small>
              <small class="text-white-50">{{ meme.date }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <nav aria-label="Page navigation" class="mt-4">
      <ul class="pagination justify-content-center">
        <li class="page-item disabled">
          <a class="page-link" href="#" tabindex="-1">上一页</a>
        </li>
        <li class="page-item active"><a class="page-link" href="#">1</a></li>
        <li class="page-item"><a class="page-link" href="#">2</a></li>
        <li class="page-item"><a class="page-link" href="#">3</a></li>
        <li class="page-item">
          <a class="page-link" href="#">下一页</a>
        </li>
      </ul>
    </nav>
  </main>
</template>

<script>
export default {
  name: 'MainContent',
  data() {
    return {
      memes: [
        {
          id: 1,
          title: '躺平',
          description: '指无论对方做出什么反应，你内心都毫无波澜，对此不会有任何反应或者反抗，表示顺从心理。',
          category: '生活态度',
          date: '2024年'
        },
        {
          id: 2,
          title: '内卷',
          description: '形容过度竞争，导致人们投入大量精力却无法提高整体效益的现象。',
          category: '社会现象',
          date: '2024年'
        },
        {
          id: 3,
          title: '破防',
          description: '原指游戏中突破对方防御，现多用于形容心理防线被突破，情绪失控。',
          category: '情感表达',
          date: '2024年'
        },
        {
          id: 4,
          title: 'YYDS',
          description: '永远的神，用于表达对某事物的高度赞美。',
          category: '缩写用语',
          date: '2024年'
        },
        {
          id: 5,
          title: '绝绝子',
          description: '表示太好了或太棒了，一种夸张的赞美表达方式。',
          category: '流行语',
          date: '2024年'
        },
        {
          id: 6,
          title: '社死',
          description: '社会性死亡，指在社交场合中遭遇尴尬，感到无地自容。',
          category: '社交现象',
          date: '2024年'
        }
      ]
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-outline-primary {
  color: #0d6efd;
  border-color: #0d6efd;
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  color: white;
}
</style>