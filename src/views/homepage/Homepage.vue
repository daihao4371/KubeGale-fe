<template>
  <div class="homepage-container">
    <!-- 左侧菜单栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        KubeGale 管理系统
      </div>
      <div class="sidebar-menu">
        <div
          v-for="item in menuItems"
          :key="item.id"
          class="menu-item-container"
        >
          <div
            class="menu-item"
            :class="{ active: activeMenu === item.id }"
            @click="selectMenu(item.id)"
          >
            <el-icon class="menu-item-icon">
              <component :is="item.icon"></component>
            </el-icon>
            <span class="menu-title">{{ item.title }}</span>
            <el-icon v-if="item.children && item.children.length" class="menu-arrow">
              <arrow-down v-if="expandedMenus.includes(item.id)" />
              <arrow-right v-else />
            </el-icon>
          </div>
          
          <!-- 子菜单 -->
          <div 
            v-if="item.children && item.children.length && expandedMenus.includes(item.id)" 
            class="submenu"
          >
            <div
              v-for="child in item.children"
              :key="child.id"
              class="submenu-item"
              :class="{ active: activeMenu === child.id }"
              @click="selectMenu(child.id)"
            >
              <el-icon class="menu-item-icon">
                <component :is="child.icon"></component>
              </el-icon>
              <span class="menu-title">{{ child.title }}</span>
            </div>
          </div>
        </div>
        
        <!-- 退出登录按钮 -->
        <div class="menu-item logout-item" @click="handleLogout">
          <el-icon class="menu-item-icon">
            <SwitchButton />
          </el-icon>
          <span class="menu-title">退出登录</span>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <div class="header">
        <div>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ menuItems.find(item => item.id === activeMenu)?.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div>
          <span>欢迎，{{ username }} | </span>
          <span>{{ currentTime }}</span>
        </div>
      </div>
      <div class="content">
        <router-view></router-view>
        <!-- 如果没有对应的路由视图，显示欢迎信息 -->
        <div v-if="!$route.matched.length">
          <h2>欢迎使用 KubeGale 管理系统</h2>
          <p>请从左侧菜单选择功能模块</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useHomepage from './homepage.ts'
import { 
  Setting, 
  Document, 
  Ship, 
  Monitor, 
  Tools, 
  Box, 
  Connection,
  SwitchButton,
  ArrowDown,
  ArrowRight,
  User,
  UserFilled,
  Menu,
  HomeFilled,
  DataAnalysis
} from '@element-plus/icons-vue'

const {
  menuItems,
  activeMenu,
  expandedMenus,
  selectMenu,
  username,
  currentTime,
  handleLogout
} = useHomepage()
</script>
<style src="./homepage.css"></style>
<style>
</style>
