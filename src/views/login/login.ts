import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock, View as ElIconView, Hide as ElIconHide } from '@element-plus/icons-vue'
import { getCaptcha } from '@/api/login/captcha'

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
  ]
})

export const captchaImg = ref('')
export const captchaId = ref('')

export const fetchCaptcha = async () => {
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

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async valid => {
    if (valid) {
      loading.value = true
      try {
        // 发送登录请求
        const res = await fetch('/base/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: loginForm.username,
            password: loginForm.password,
            captchaId: captchaId.value,
            captcha: loginForm.captcha
          })
        })
        const data = await res.json()
        if (data.code === 0) {
          ElMessage.success('登录成功')
          // router.push('/')
        } else {
          ElMessage.error(data.msg || '登录失败')
          fetchCaptcha()
        }
      } catch (error) {
        ElMessage.error('登录失败，请稍后重试')
        fetchCaptcha()
      } finally {
        loading.value = false
      }
    }
  })
}

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
  console.log('密码可见性:', passwordVisible.value ? '显示' : '隐藏')
}

export {
  loginFormRef,
  loading,
  rememberMe,
  passwordVisible,
  loginForm,
  loginRules,
  handleLogin,
  togglePasswordVisibility
}