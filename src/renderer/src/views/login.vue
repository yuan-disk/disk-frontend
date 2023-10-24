<template>
  <div class="container">
    <div class="center">
      <div class="project-name">原盘</div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-width="80px"
        label-position=""
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="loginForm.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model.trim="loginForm.password" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(loginFormRef)">启动！</el-button>
          <router-link to="/registry">没有账号？转到注册</router-link>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import router from '../router/index.js'
import server from '../js/request'
import net_status from '../js/status_code'

const loginFormRef = reactive()

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]*$/, message: '用户名只能包含数字和英文字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, message: '密码长度必须大于4位', trigger: 'blur' }
  ]
})

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      server
        .post('/user/login', loginForm)
        .then((response) => {
          if (response.data.code === net_status.success) {
            window.store.set('token', response.data.data.token)
            router.push({
              path: '/'
            })
          } else {
            ElMessage(error.response.data.message)
          }
        })
        .catch((error) => {
          ElMessage('未知错误')
        })
    } else {
      ElMessage('输入错误')
    }
  })
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  width: 100%;
}

.project-name {
  font-family: 宋体;
  text-align: center;
  font-size: 2em;
  margin-bottom: 20px;
}

.center {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-button {
  width: 230px;
}

.el-input {
  width: 230px;
}
</style>
