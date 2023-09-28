<template>
  <el-container style="height: 100%">
    <el-aside>
      <el-menu
        default-active="/"
        :collapse="true"
        @open="handleOpen"
        @close="handleClose"
        router="true"
      >
        <el-menu-item class="menu-fix" index="/">
          <el-icon><location /></el-icon>
          <div class="menu-title-fix">文件</div>
        </el-menu-item>

        <el-menu-item class="menu-fix" index="/index/share/">
          <el-icon><icon-menu /></el-icon>
          <div class="menu-title-fix">共享</div>
        </el-menu-item>

        <el-menu-item class="menu-fix" index="/index/translate/">
          <el-icon><document /></el-icon>
          <div class="menu-title-fix">传输</div>
        </el-menu-item>

        <el-menu-item class="spacer"> </el-menu-item>

        <el-menu-item class="menu-fix" index="/index/settings">
          <el-icon><setting /></el-icon>
          <div class="menu-title-fix">设置</div>
        </el-menu-item>

        <el-menu-item class="menu-fix" index="/login">
          <el-icon><setting /></el-icon>
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
import { Document, Menu as IconMenu, Location, Setting } from '@element-plus/icons-vue'

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style scoped>
.spacer {
  flex: 1 1 auto;
}
.menu-title-fix {
  line-height: normal;
  display: block;
  font-family: 'Courier New', Courier, monospace;
  font-size: small;
}

.menu-fix {
  margin-bottom: 5px;
  flex-direction: column;
  justify-content: center;
}
.el-aside {
  width: var(--el-aside-width, 100);
}
</style>
