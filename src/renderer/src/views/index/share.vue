<template>
  <el-container>
    <el-header> <h2>共享盘</h2></el-header>
    <el-main>
      <div class="flex-row">
        <el-checkbox
          v-model="select_allfiles"
          :indeterminate="is_indeterminate()"
          @change="selectAllfiles"
          class="flex-keep"
          >{{ checkDisplayMessage() }}</el-checkbox
        >
        <div class="expanding"></div>
        <!-- <el-button class="flex-keep">按时间排序</el-button> -->
        <el-dropdown @command="handleCommand" trigger="click" class="flex-keep">
          <span class="el-dropdown-link">
            <el-icon><Sort /></el-icon>
            按时间排序
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="a">名称</el-dropdown-item>
              <el-dropdown-item command="b">时间</el-dropdown-item>
              <el-dropdown-item command="c">大小</el-dropdown-item>
              <el-dropdown-item command="d" disabled>Action 4</el-dropdown-item>
              <el-dropdown-item command="e" divided>Action 5</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button v-if="is_grid" @click="is_grid = false" class="flex-keep display-mode-btn"
          ><el-icon><Operation /></el-icon
        ></el-button>
        <el-button v-if="!is_grid" @click="is_grid = true" class="flex-keep display-mode-btn"
          ><el-icon><Grid /></el-icon
        ></el-button>
      </div>
      <FileGrid style="padding: 0%" v-model:selectlist="selectlist" :filelist="filelist"></FileGrid>
    </el-main>
  </el-container>
</template>

<style scoped>
.flex-row {
  display: flex;
  flex-direction: row;
  width: 95%;
  justify-content: space-between;
  align-items: center;
}

.expanding {
  flex: 1 1 auto;
}

.flex-keep {
  flex: 0 1 auto;
}

.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

.el-dropdown {
  padding: 5px 8px;
  border-radius: 4px;
}

.el-dropdown:hover {
  background: rgb(245, 245, 246);
}

.display-mode-btn {
  border: 0;
}
.display-mode-btn:hover {
  background: rgb(245, 245, 246);
  color: grey;
}
</style>

<script setup>
import FileGrid from '../../components/FileGrid.vue'

import { Sort, Grid, Operation } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'

const is_grid = ref(true)

const select_allfiles = ref(false)
const selectlist = ref([])

const filelist = ref([
  {
    name: '4小时学完概率论',
    update_time: 1696852395918,
    type: 'file',
    is_folder: 0,
    path: '/'
  },
  {
    name: '4小时学完概率论(2)',
    update_time: 1696852395918,
    type: 'folder',
    path: '/',
    is_folder: 1
  },
  {
    name: '4小时学完概率论都是发士大夫士大夫撒旦开发士大夫士大夫凯撒的浪费',
    update_time: 1696852395918,
    type: 'folder',
    path: '/',
    is_folder: 1
  }
])

function checkDisplayMessage() {
  if (selectlist.value.length === 0) {
    return '共' + filelist.value.length + '项'
  } else {
    return '已选' + selectlist.value.length + '项'
  }
}

watch(selectlist, (val) => {
  select_allfiles.value = val.length === filelist.value.length
})

function selectAllfiles(val) {
  selectlist.value = val ? filelist.value : []
}

function is_indeterminate() {
  return selectlist.value.length > 0 && selectlist.value.length < filelist.value.length
}
</script>
