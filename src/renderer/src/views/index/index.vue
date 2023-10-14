<template>
  <el-container class="container">
    <el-aside>
      <el-menu
        default-active="/"
        :collapse="true"
        @open="handleOpen"
        @close="handleClose"
        router="true"
        class="menu-fix"
      >
        <el-menu-item class="menu-item-fix" index="/">
          <el-icon><House /></el-icon>
          <div class="menu-title-fix">文件</div>
        </el-menu-item>

        <el-menu-item class="menu-item-fix" index="/index/share/">
          <el-icon><Connection /></el-icon>
          <div class="menu-title-fix">共享</div>
        </el-menu-item>

        <el-menu-item class="menu-item-fix" index="/index/translate/">
          <el-icon><sort /></el-icon>
          <div class="menu-title-fix">传输</div>
        </el-menu-item>

        <div class="spacer"></div>

        <el-menu-item class="menu-item-fix" index="/index/settings">
          <el-icon><setting /></el-icon>
          <div class="menu-title-fix">设置</div>
        </el-menu-item>

        <el-menu-item class="menu-item-fix" index="/login">
          <el-icon><right /></el-icon>
          <div class="menu-title-fix">登出</div>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </el-container>
</template>

<script lang="ts" setup>
import { House, Connection, Right, Setting, Sort } from '@element-plus/icons-vue'

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style scoped>
.menu-fix {
  height: 95%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.container {
  height: 100%;
  width: 100%;
}
.spacer {
  flex-grow: 1;
}

.menu-title-fix {
  line-height: normal;
  display: block;
  font-family: 'Courier New', Courier, monospace;
  font-size: small;
}

.menu-item-fix {
  margin-bottom: 5px;
  flex-direction: column;
  justify-content: center;
  flex: 0, 0, auto;
}

.el-aside {
  width: var(--el-aside-width, 100);
}
</style>
