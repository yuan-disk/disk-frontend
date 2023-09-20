<template>
  <el-container>
    <el-aside>
      <el-menu
        default-active="/index/save"
        :collapse="true"
        @open="handleOpen"
        @close="handleClose"
        router="true"
      >
        <el-menu-item index="/">
          <el-icon><location /></el-icon>
          <template #title>Navigator One</template>
        </el-menu-item>

        <el-menu-item index="/index/translate/">
          <el-icon><icon-menu /></el-icon>
          <template #title>传输</template>
        </el-menu-item>

        <el-menu-item index="/">
          <el-icon><document /></el-icon>
          <template #title>Navigator Three</template>
        </el-menu-item>

        <el-menu-item index="/">
          <el-icon><setting /></el-icon>
          <template #title>Navigator Four</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <router-view></router-view>
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
.el-aside {
  width: var(--el-aside-width, 60);
}
</style>
