<template>
  <el-container>
    <el-header> 上传 </el-header>
    <el-main>
      <el-table :data="files_to_upload" @selection-change="handleSelectionTaskChange">
        <el-table-column label="名称">
          <template #default="scope">
            <div>
              {{ scope.row.file.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="大小" prop="size"></el-table-column>
        <el-table-column label="状态">
          <template #default="scope"> </template>
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script setup>
import { reactive } from 'vue'

const task = reactive({
  file: {
    name: 'test.html',
    size: 100
  },
  task_status: 'waiting',
  progress: 0,
  size: 10000
})

const files_to_upload = reactive([task])

function handleSelectionTaskChange(val) {
  console.log(val)
}
</script>

<style></style>
