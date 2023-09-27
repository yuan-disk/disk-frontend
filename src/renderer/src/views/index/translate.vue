<template>
  <el-container>
    <el-header> 传输 </el-header>
    <el-table :data="files_to_upload">
      <el-table-column label="名称" prop="name"></el-table-column>
      <el-table-column label="大小" prop="size"></el-table-column>
      <el-table-column label="状态">
        <template #default="scope"> </template>
      </el-table-column>
    </el-table>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeMount, onUnmounted } from 'vue'
import bus from '../../js/event'
import { ElMessage } from 'element-plus'

const files_to_upload = ref([
  {
    name: 'hh',
    size: 84329
  }
])

function addUploadFile(file) {
  if (files_to_upload.value.length === 0) {
  }
  console.log(file)

  files_to_upload.value.push({
    name: file.name,
    size: file.size
  })
  ElMessage(file.name + ' added to filelist')
  console.log(files_to_upload)
}

onMounted(() => {
  bus.on('upload-file', addUploadFile)
})

onBeforeMount(() => {
  bus.off('upload-file')
})

onUnmounted(() => ElMessage('Unmounted'))
</script>
