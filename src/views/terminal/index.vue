<template>
  <div class="terminal-page">
    <div class="terminal-header">
      <div class="terminal-title">
        <el-icon><Connection /></el-icon>
        <span>{{ title }}</span>
      </div>
      <div class="terminal-actions">
        <el-button type="primary" link @click="handleReconnect">
          <el-icon><Refresh /></el-icon>
          重新连接
        </el-button>
        <el-button type="danger" link @click="handleClose">
          <el-icon><Close /></el-icon>
          关闭
        </el-button>
      </div>
    </div>
    <div class="terminal-container">
      <div id="terminal" class="terminal"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { Connection, Refresh, Close } from '@element-plus/icons-vue'
import { getTerminalWebSocket } from '@/api/cmdb/host'
import { ElMessage } from 'element-plus'
import 'xterm/css/xterm.css'

defineOptions({
  name: 'TerminalView'
})

const route = useRoute()
const title = ref('终端')

// 终端相关
let terminal: Terminal | null = null
let fitAddon: FitAddon | null = null
let socket: WebSocket | null = null
let commandBuffer = '' // 用于存储当前输入的命令

// 初始化终端
const initTerminal = () => {
  const height = window.innerHeight - 140
  const width = window.innerWidth - 230

  terminal = new Terminal({
    rows: parseInt(String(height/17), 10), // 根据高度计算行数
    cols: parseInt(String(width/8), 10), // 根据宽度计算列数
    cursorStyle: 'block', // 设置光标样式为块状
    cursorBlink: true, // 光标闪烁
    scrollback: 1000, // 回滚的行数
    theme: {
      background: '#000000', // 背景色
      foreground: '#ffffff'  // 字体颜色
    }
  })

  fitAddon = new FitAddon()
  terminal.loadAddon(fitAddon)
  
  const terminalElement = document.getElementById('terminal')
  if (terminalElement) {
    terminal.open(terminalElement)
    fitAddon.fit()
  }

  // 监听用户输入
  terminal.onData((data) => {
    if (data === '\r') {
      // 当按下回车键时，显示完整命令并发送到服务器
      terminal?.write('\r\n')  // 显示回车后的空行
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(commandBuffer + '\n')
      }
      commandBuffer = '' // 清空缓冲区
    } else if (data === '\u007f') {
      // 处理退格键
      if (commandBuffer.length > 0) {
        commandBuffer = commandBuffer.slice(0, -1)
        terminal?.write('\b \b')  // 在终端上模拟删除字符
      }
    } else {
      // 将输入的命令显示到终端上，并存入缓冲区
      commandBuffer += data
      terminal?.write(data)  // 显示用户输入
    }
  })
}

// 连接 WebSocket
const connectWebSocket = () => {
  const wsUrl = route.query.wsUrl as string

  if (!wsUrl) {
    ElMessage.error('缺少WebSocket连接地址')
    return
  }

  try {
    // 建立 WebSocket 连接
    socket = getTerminalWebSocket(wsUrl)

    // 连接建立时的处理
    socket.onopen = () => {
      ElMessage({
        type: 'success',
        message: 'SSH会话已建立'
      })
      // 连接成功后，可以开始接收数据
      terminal?.focus()
    }

    // 接收服务器消息
    socket.onmessage = (event) => {
      // 处理换行符，确保每个输出行正确显示
      const processedMessage = event.data.replace(/\r?\n/g, '\r\n')
      terminal?.write(processedMessage)
    }

    // 处理错误
    socket.onerror = (error) => {
      console.error('WebSocket 错误:', error)
      ElMessage({
        type: 'error',
        message: 'SSH会话连接错误'
      })
    }

    // 连接关闭时的处理
    socket.onclose = (event) => {
      console.log('WebSocket 连接关闭:', event)
      ElMessage({
        type: 'warning',
        message: 'SSH会话已关闭'
      })
    }

    // 处理终端大小变化
    terminal?.onResize(({ cols, rows }) => {
      if (socket?.readyState === WebSocket.OPEN) {
        // 发送终端大小变化到服务器
        socket.send(JSON.stringify({ type: 'resize', cols, rows }))
      }
    })
  } catch (error) {
    console.error('建立SSH会话失败:', error)
    ElMessage.error('建立SSH会话失败')
  }
}

// 重新连接
const handleReconnect = () => {
  if (socket) {
    socket.close()
  }
  if (terminal) {
    terminal.clear()
    commandBuffer = ''
  }
  connectWebSocket()
}

// 关闭终端
const handleClose = () => {
  if (socket) {
    socket.close()
  }
  window.close()
}

onMounted(() => {
  // 设置标题
  const host = route.query.host as string
  const name = route.query.name as string
  if (host && name) {
    title.value = `终端 - ${name} (${host})`
  }
  
  // 初始化终端
  initTerminal()
  
  // 建立 WebSocket 连接
  connectWebSocket()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    fitAddon?.fit()
  })
})

onUnmounted(() => {
  if (socket) {
    socket.close()
  }
  if (terminal) {
    terminal.dispose()
  }
  window.removeEventListener('resize', () => {
    fitAddon?.fit()
  })
})
</script>

<style scoped>
.terminal-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
  z-index: 9999;
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #2d2d2d;
  color: #fff;
  border-bottom: 1px solid #3d3d3d;
}

.terminal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.terminal-actions {
  display: flex;
  gap: 16px;
}

.terminal-container {
  flex: 1;
  padding: 10px;
  overflow: hidden;
}

.terminal {
  width: 100%;
  height: 100%;
  background-color: black;
}

:deep(.el-button) {
  color: #fff;
}

:deep(.el-button:hover) {
  color: var(--el-color-primary);
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style> 