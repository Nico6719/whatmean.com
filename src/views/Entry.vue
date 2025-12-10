<template>
  <div class="home-page">
    <div class="container-fluid px-4 px-md-5 pt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div></div> <!-- 空的占位符，保持布局结构 -->
        <div>

        </div>
      </div>
      
      <!-- 居中的白色标题 -->
      <div class="row">
        <div class="col-12 text-center mb-4">
          <h1 class="text-white">网络热梗词条</h1>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-xl-3 col-lg-4 col-md-6" v-for="meme in allMemes" :key="meme.id">
          <div class="card h-100 liquid-glass-card meme-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div class="badge liquid-badge">{{ meme.category }}</div>
                <small class="text-muted">{{ meme.date }}</small>
              </div>
              <h3 class="card-title h5">{{ meme.title }}</h3>
              <p class="card-text">{{ meme.description }}</p>
              <div class="d-flex justify-content-between align-items-center">
                <div class="tags">
                </div>
                <a href="#" class="btn btn-outline-primary btn-sm liquid-glass-btn">了解更多</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 添加额外的间距 -->
  <div class="mb-5"></div>
</template>

<script>
export default {
  name: 'Entry',
  data() {
    return {
      allMemes: [
        {
          id: 1,
          title: '躺平',
          description: '指无论对方做出什么反应，你内心都毫无波澜，对此不会有任何反应或者反抗，表示顺从心理。',
          category: '生活态度',
          date: '2024年',
          tags: ['2021', '社会现象']
        },
        {
          id: 2,
          title: '内卷',
          description: '形容过度竞争，导致人们投入大量精力却无法提高整体效益的现象。',
          category: '社会现象',
          date: '2024年',
          tags: ['2020', '职场']
        },
        {
          id: 3,
          title: '破防',
          description: '原指游戏中突破对方防御，现多用于形容心理防线被突破，情绪失控。',
          category: '情感表达',
          date: '2024年',
          tags: ['游戏术语', '情感']
        },
        {
          id: 4,
          title: 'YYDS',
          description: '永远的神，用于表达对某事物的高度赞美。',
          category: '缩写用语',
          date: '2024年',
          tags: ['缩写', '赞美']
        },
        {
          id: 5,
          title: '绝绝子',
          description: '表示太好了或太棒了，一种夸张的赞美表达方式。',
          category: '流行语',
          date: '2024年',
          tags: ['赞美', '夸张']
        },
        {
          id: 6,
          title: '社死',
          description: '社会性死亡，指在社交场合中遭遇尴尬，感到无地自容。',
          category: '社交现象',
          date: '2024年',
          tags: ['社交', '尴尬']
        },
        {
          id: 7,
          title: '显眼包',
          description: '原本指那些喜欢表现自己、引人注意的人，在网络语境中常用来调侃那些行为夸张、引人注目的人或事。',
          category: '人物描述',
          date: '2024年',
          tags: ['人物', '调侃']
        },
        {
          id: 8,
          title: '摆烂',
          description: '源自篮球术语，意为故意不努力、任由事情恶化的行为，后广泛用于形容面对困难时选择放弃的态度。',
          category: '态度表达',
          date: '2024年',
          tags: ['态度', '放弃']
        },
        {
          id: 9,
          title: 'emo',
          description: '原指一种音乐风格，现多用于表达负面情绪，如忧郁、伤感等。',
          category: '情感表达',
          date: '2024年',
          tags: ['情感', '音乐']
        },
        {
          id: 10,
          title: '打工人',
          description: '原本指从事体力劳动的人，网络语境中泛指为生活奔波的上班族，带有自嘲和调侃意味。',
          category: '身份标签',
          date: '2024年',
          tags: ['职场', '自嘲']
        },
        {
          id: 11,
          title: '凡尔赛',
          description: '指通过看似低调的方式进行炫耀，源自日本漫画《凡尔赛玫瑰》。',
          category: '炫耀方式',
          date: '2024年',
          tags: ['炫耀', '文学']
        },
        {
          id: 12,
          title: '夺笋呐',
          description: '网络流行语，"多损啊"的谐音，用于吐槽某人行为很损。',
          category: '谐音梗',
          date: '2024年',
          tags: ['谐音', '吐槽']
        }
      ]
    }
  }
}
</script>

<style scoped>
.meme-card {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: floatIn 0.6s ease-out;
}

.liquid-glass-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 20px;
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
  border-radius: 25px;
  transition: all 0.4s ease;
}

.liquid-glass-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 15px 45px rgba(31, 38, 135, 0.2),
    inset 0 2px 12px rgba(255, 255, 255, 0.4),
    inset 0 -2px 12px rgba(0, 0, 0, 0.08);
}

.liquid-glass-card:hover::before {
  top: -15px;
  left: -15px;
  right: -15px;
  bottom: -15px;
}

.liquid-badge {
  background: linear-gradient(45deg, #0d6efd, #0b5ed7);
  color: white;
  border-radius: 20px;
  padding: 0.5em 1em;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.25);
  transition: all 0.3s ease;
}

.liquid-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 15px rgba(13, 110, 253, 0.35);
}

.tag-badge {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-weight: normal;
  transition: all 0.3s ease;
}

.tag-badge:hover {
  background: rgba(13, 110, 253, 0.2);
  transform: translateY(-2px);
}

.liquid-glass-btn {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  position: relative;
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

.liquid-glass-btn:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.liquid-glass-btn:hover::before {
  opacity: 1;
}

.btn-outline-primary {
  color: #0d6efd;
  border-color: rgba(13, 110, 253, 0.4);
}

.btn-outline-primary:hover {
  background-color: rgba(13, 110, 253, 0.2);
  color: #0d6efd;
  border-color: #0d6efd;
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(30px);
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
  
  .g-4 {
    --bs-gutter-x: 1rem;
  }
  
  .liquid-glass-card {
    border-radius: 16px;
  }
}
</style>