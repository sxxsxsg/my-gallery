<script setup>
import { ref, onMounted } from 'vue';

// --- 登录状态变量 ---
const username = ref('');
const password = ref('');
const message = ref('');
const isLoggedIn = ref(false);
const loggedInUser = ref('');

// --- 【新增】文件上传状态变量 ---
const selectedFile = ref(null);
const uploadMessage = ref('');


// --- 页面加载时自动检查登录状态 ---
onMounted(() => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('authUser');
  if (token && user) {
    isLoggedIn.value = true;
    loggedInUser.value = user;
  }
});

// --- 登录函数 ---
async function handleLogin() {
  // ... (此函数保持不变，无需复制)
  message.value = '正在登录...';
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      message.value = '';
      loggedInUser.value = data.user.username;
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', data.user.username);
      isLoggedIn.value = true;
    } else {
      message.value = `登录失败: ${data.error}`;
    }
  } catch (error) {
    message.value = '登录请求失败，请检查网络或代理配置。';
    console.error('登录异常:', error);
  }
}

// --- 退出登录函数 ---
function handleLogout() {
  // ... (此函数保持不变，无需复制)
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  isLoggedIn.value = false;
  loggedInUser.value = '';
}

// --- 【新增】处理文件选择的函数 ---
function handleFileChange(event) {
  selectedFile.value = event.target.files[0];
  uploadMessage.value = ''; // 清除旧消息
}

// --- 【新增】处理文件上传的核心函数 ---
async function handleUpload() {
  if (!selectedFile.value) {
    uploadMessage.value = '请先选择一个文件！';
    return;
  }

  uploadMessage.value = '正在上传...';
  
  // 1. 从“保险箱”里取出通行证
  const token = localStorage.getItem('authToken');
  if (!token) {
    uploadMessage.value = '认证失败，请重新登录。';
    return;
  }

  // 2. 创建一个 FormData “包裹”，把文件放进去
  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
    // 3. 发送请求到我们部署好的后端
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        // 【关键】附上我们的“通行证”
        'Authorization': `Bearer ${token}`
      },
      body: formData, // 直接发送包裹
    });

    const data = await response.json();

    if (response.ok) {
      uploadMessage.value = `上传成功！文件名: ${data.fileName}`;
    } else {
      uploadMessage.value = `上传失败: ${data.error}`;
    }
  } catch (error) {
    uploadMessage.value = '上传请求失败，请检查网络。';
    console.error('上传异常:', error);
  }
}
</script>

<template>
  <!-- 登录视图 (保持不变) -->
  <div v-if="!isLoggedIn" class="login-container">
    <!-- ... (这部分内容和之前一样，无需修改) ... -->
    <div class="login-box">
      <h1>画廊登录</h1>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="username">用户名</label>
          <input type="text" id="username" v-model="username" required>
        </div>
        <div class="input-group">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit">登录</button>
        <p v-if="message" class="message">{{ message }}</p>
      </form>
    </div>
  </div>
  <!-- 后台管理视图 (升级版) -->
  <div v-else class="management-container">
    <header class="main-header">
      <h1>画廊后台管理</h1>
      <div class="user-info">
        <span>欢迎您, {{ loggedInUser }}</span>
        <button @click="handleLogout" class="logout-button">退出登录</button>
      </div>
    </header>
    <main class="content-area">
      <section class="upload-section">
        <h2>上传新图片</h2>
        <form @submit.prevent="handleUpload" class="upload-form">
          <div class="file-input-wrapper">
            <input type="file" @change="handleFileChange" accept="image/*" class="file-input">
            <span>{{ selectedFile ? selectedFile.name : '选择一张图片...' }}</span>
          </div>
          <button type="submit" class="upload-button">上传</button>
        </form>
        <p v-if="uploadMessage" class="upload-message">{{ uploadMessage }}</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* 使用 min-height 保证内容多时也能撑开 */
  background-color: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  padding: 1rem; /* 在小屏幕上增加一些边距 */
  box-sizing: border-box; /* 确保内边距不会导致溢出 */
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* 阴影更柔和 */
  width: 100%;
  max-width: 400px; /* 移动设备上的最大宽度 */
  box-sizing: border-box;
  transition: all 0.3s ease; /* 添加一个平滑的过渡效果 */
}

/* --- 媒体查询魔法在这里！--- */
/* 当屏幕宽度大于等于 768px 时，应用以下样式 */
@media (min-width: 768px) {
  .login-box {
    max-width: 480px; /* 在大屏幕上，盒子可以更宽 */
    padding: 2.5rem 3rem; /* 内边距也更大气 */
  }
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.75rem; /* 稍微增大标题字号 */
}

.input-group {
  margin-bottom: 1.25rem; /* 增大输入框间距 */
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555; /* 颜色稍深 */
  font-weight: 600; /* 字体加粗 */
}

input {
  width: 100%;
  padding: 0.85rem;
  border: 1px solid #ccc;
  border-radius: 6px; /* 圆角更大 */
  box-sizing: border-box;
  font-size: 1rem;
}

input:focus {
  border-color: #007bff; /* 聚焦时边框变色 */
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

button {
  width: 100%;
  padding: 0.85rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem; /* 增大按钮字号 */
  font-weight: 600;
  transition: background-color 0.2s ease; /* 添加按钮悬停效果 */
}

button:hover {
  background-color: #0056b3;
}
.message {
  text-align: center;
  margin-top: 1rem;
  color: red;
}
.message:not(:empty) {
  padding: 0.75rem;
  border-radius: 6px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}
/* --- 后台管理界面样式 --- */
.management-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.logout-button:hover {
  background-color: #c82333;
}

.content-area {
  padding: 2rem;
}
/* --- 上传区域样式 --- */
.upload-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 2rem;
  border: 1px solid #eee;
  max-width: 600px;
  margin: 0 auto;
}
.upload-form {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.file-input-wrapper {
  flex-grow: 1;
  position: relative;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.75rem;
  background-color: white;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.upload-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease;
}
.upload-button:hover {
  background-color: #0056b3;
}
.upload-message {
  margin-top: 1rem;
  font-weight: 500;
  color: #28a745; /* 成功是绿色 */
}
/* 简单的错误提示样式 */
.upload-message:not(:empty):not(:containing("成功")) {
  color: #dc3545; /* 失败是红色 */
}
</style>
