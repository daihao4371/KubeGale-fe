<!-- eslint-disable -->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock, View as ElIconView, Hide as ElIconHide } from '@element-plus/icons-vue'
import { getCaptcha } from '@/api/login/captcha'
import { login } from '@/api/login/login'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)
const passwordVisible = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: '123456',
  captcha: ''
})

const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
})

const captchaImg = ref('')
const captchaId = ref('')

const fetchCaptcha = async () => {
  try {
    const res = await getCaptcha()
    if (res.data.code === 0) {
      captchaImg.value = res.data.data.picPath
      captchaId.value = res.data.data.captchaId
    }
  } catch (e) {
    captchaImg.value = ''
    captchaId.value = ''
  }
}

onMounted(() => {
  fetchCaptcha()
})

// 保存token到localStorage
const saveToken = (token: string) => {
  localStorage.setItem('token', token)
}

// 保存用户信息到localStorage
const saveUserInfo = (userInfo: any) => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async valid => {
    if (valid) {
      loading.value = true
      try {
        const res = await login({
          username: loginForm.username,
          password: loginForm.password,
          captchaId: captchaId.value,
          captcha: loginForm.captcha
        })
        
        if (res.data.code === 0) {
          ElMessage.success('登录成功')
          
          // 保存token和用户信息
          saveToken(res.data.data.token)
          saveUserInfo(res.data.data.user)
          
          // 跳转到首页
          router.push('/')
        } else {
          ElMessage.error(res.data.msg || '登录失败')
          // 刷新验证码
          fetchCaptcha()
        }
      } catch (error) {
        ElMessage.error('登录失败，请稍后重试')
        // 刷新验证码
        fetchCaptcha()
      } finally {
        loading.value = false
      }
    }
  })
}

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}
</script>
<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-left">
        <div class="login-illustration">
          <img src="@/assets/images/login.gif" alt="系统插图" />
          <h3>开箱即用的大型平台管理系统</h3>
          <p>智能化的运维管理</p>
        </div>
      </div>
      <div class="login-right">
        <div class="login-form-container">
          <h2>欢迎回来 👋</h2>
          <p class="login-subtitle">请输入您的账号和密码登录系统</p>
          <form class="login-form" @submit.prevent="handleLogin" ref="loginFormRef">
            <div class="form-item">
              <label for="username">用户名</label>
              <input id="username" type="text" placeholder="请输入用户名" v-model="loginForm.username" />
            </div>
            <div class="form-item">
              <label for="password">密码</label>
              <div style="position: relative;">
                <input id="password" :type="passwordVisible ? 'text' : 'password'" placeholder="请输入密码" v-model="loginForm.password" />
                <span class="password-eye" @click="togglePasswordVisibility" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);">
                  <component :is="passwordVisible ? ElIconView : ElIconHide" />
                </span>
              </div>
            </div>
            <div class="form-item captcha-row">
              <label for="captcha" style="margin-bottom:0;">验证码</label>
              <input id="captcha" class="captcha-input" type="text" placeholder="请输入验证码" v-model="loginForm.captcha" />
              <img
                :src="captchaImg"
                alt="验证码"
                class="captcha-img"
                @click="fetchCaptcha"
                title="点击刷新验证码"
              />
            </div>
            <button type="submit" class="login-button" :disabled="loading">
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<style src="./login.css"></style>