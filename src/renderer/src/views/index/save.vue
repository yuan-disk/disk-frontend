<template>
  <el-container>
    <el-header><h2 style="margin: 0px 0px 0px 0px">储存盘</h2></el-header>
    <el-main>
      <el-row>
        <el-col :span="5">
          <el-checkbox
            v-model="isSelectAll"
            :indeterminate="notSelectAllFolders"
            @change="handleCheckAllChange"
            >{{ selectMessage }}</el-checkbox
          >
        </el-col>
        <el-col :span="14"></el-col>
        <el-col :span="3">
          <el-dropdown @command="handleCommand" class="sort-fix">
            <span class="el-dropdown-link sort-span-fix"
              ><el-icon class="el-icon--right"><Sort /></el-icon> 按{{ sortedMethod }}排序
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="名称">名称</el-dropdown-item>
                <el-dropdown-item command="创建时间">创建时间</el-dropdown-item>
                <el-dropdown-item command="修改时间">修改时间</el-dropdown-item>
                <el-dropdown-item command="文件大小">文件大小</el-dropdown-item>
                <el-dropdown-item command="desc">升序</el-dropdown-item>
                <el-dropdown-item command="asc">降序</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-col>

        <el-col :span="2"> <el-button @click="getFileList">Refresh</el-button></el-col>
      </el-row>

      <el-checkbox-group v-model="selectedFolders" @change="handleCheckedCitiesChange">
        <el-checkbox v-for="city in allFolders" :key="city" :label="city">{{ city }}</el-checkbox>
      </el-checkbox-group>
      <upload />

      <el-table :data="fileList" style="width: 100%">
        <el-table-column prop="fileName" label="filename" width="180" />
        <el-table-column prop="size" label="size" width="180" />
        <el-table-column label="Operation">
          <template #default="scope">
            <el-button @click.prevent="downloadRow(scope.row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>

      <folder />
    </el-main>
  </el-container>
</template>
<script setup>
import { ref } from 'vue'
import upload from '../../components/upload.vue'
import folder from '../../components/folder.vue'

import { ElMessage } from 'element-plus'
import { Sort } from '@element-plus/icons-vue'
import server from '../../js/request'

const isSelectAll = ref(false)
const notSelectAllFolders = ref(false)
const selectedFolders = ref([])
const selectMessage = ref('共n项')
const allFolders = ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen']
const sortedMethod = ref('')

const downloadRow = (file) => {
  console.log(file)
  ElMessage('开始下载' + file.fileName)
  server
    .post(
      '/file/' + file.id,
      { from: 0, to: file.chunks.length },
      {
        responseType: 'arraybuffer'
      }
    )
    .then((response) => {
      window.core.writeFileByArrayBuffer(file.fileName, response.data)
    })
}

const fileList = ref([])

function getFileList() {
  server
    .get('/file')
    .then((response) => {
      fileList.value = response.data.data.files
    })
    .catch(() => {
      ElMessage('未知错误')
    })
}

getFileList()

const handleCommand = (command) => {
  sortedMethod.value = command.toString()
  ElMessage(`click on item ${command}`)
}

const handleCheckAllChange = (val) => {
  selectedFolders.value = val ? allFolders : []
  notSelectAllFolders.value = false

  if (selectedFolders.value.length == 0) {
    selectMessage.value = '共' + allFolders.length + '项'
  } else {
    selectMessage.value = '已选' + selectedFolders.value.length + '项'
  }
}

const handleCheckedCitiesChange = (value) => {
  const checkedCount = value.length
  isSelectAll.value = checkedCount === allFolders.length
  notSelectAllFolders.value = checkedCount > 0 && checkedCount < allFolders.length

  if (selectedFolders.value.length == 0) {
    selectMessage.value = '共' + allFolders.length + '项'
  } else {
    selectMessage.value = '已选' + selectedFolders.value.length + '项'
  }
}
</script>

<style scoped>
.bottom-line {
  border-bottom: 2px solid var(--el-border-color);
}
.sort-fix {
  height: 32px;
  margin-top: 0px;
}

.sort-span-fix {
  margin: auto;
}
</style>
