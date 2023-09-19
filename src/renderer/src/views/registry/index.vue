<template>
  <div class="container">
    <div class="center">
      <div class="project-name">原盘</div>
      <el-form :model="registerForm" :rules="rules" label-width="80px" label-position="">
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="registerForm.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model.trim="registerForm.password" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model.trim="registerForm.confirmPassword"
            type="password"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">原盘！注册！</el-button>
          <router-link to="/login">已有账号？转到登录</router-link>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]*$/, message: '用户名只能包含数字和英文字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, message: '密码长度必须大于4位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

const submitForm = () => {
  const valid = registerForm.value.$refs.validate()
  if (valid) {
    alert('提交成功!')
  } else {
    console.log('error submit!!')
    return false
  }
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
