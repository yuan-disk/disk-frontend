<template>
  <el-container>
    <el-header> 上传 </el-header>
    <el-main>
      <div class="flex">
        <div class="expand"></div>
        <el-button text class="concrete" @click="start_all">全部开始</el-button>
        <el-button text class="concrete" @click="pause_all">全部暂停</el-button>
        <el-button text class="concrete" @click="cancel_all">全部取消</el-button>
      </div>
      <el-table
        table-layout="fixed"
        :data="files_to_upload"
        @selection-change="handleSelectionTaskChange"
        flexible="true"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="名称">
          <template #default="scope">
            <div>
              <el-icon v-if="scope.row.is_folder"><Folder /></el-icon>
              <el-icon v-if="!scope.row.is_folder"><Files /></el-icon>
              {{ scope.row.file.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="">
          <template #default="scope">
            <div class="operation_show">
              <el-tooltip
                :hide-after="0"
                v-if="scope.row.task_status == 'paused'"
                content="继续"
                placement="top"
              >
                <el-button
                  :icon="CaretRight"
                  circle
                  class="no-border"
                  type="plain"
                  @click="uploader.resume(scope.row)"
                >
                </el-button>
              </el-tooltip>

              <el-tooltip
                :hide-after="0"
                v-if="scope.row.task_status != 'paused'"
                content="暂停"
                placement="top"
              >
                <el-button
                  :icon="SemiSelect"
                  circle
                  class="no-border"
                  @click="uploader.pause(scope.row)"
                >
                </el-button>
              </el-tooltip>

              <el-tooltip content="取消" placement="top" :hide-after="0">
                <el-button
                  :icon="Close"
                  circle
                  class="no-border"
                  @click="uploader.cancel(scope.row)"
                >
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="大小">
          <template #default="scope">
            {{ sizeBeautify(scope.row.progress) + '/' + sizeBeautify(scope.row.size) }}</template
          >
        </el-table-column>
        <el-table-column label="状态">
          <template #default="scope">
            <div>
              {{ statusDescription(scope.row) }}
            </div>
            <div>
              <el-progress
                :percentage="Number(((scope.row.progress * 100) / scope.row.size).toFixed(2))"
              ></el-progress>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import uploader from '../../js/uploader.js'

import { Folder, Files, Close, CaretRight, SemiSelect } from '@element-plus/icons-vue'
import mit from '../../js/event'
import { ElMessage } from 'element-plus'

const selected_tasks = ref([])

function sizeBeautify(size) {
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + 'KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / 1024 / 1024).toFixed(2) + 'MB'
  } else {
    return (size / 1024 / 1024 / 1024).toFixed(2) + 'GB'
  }
}

function start_all() {
  group_by(selected_tasks.value, (task) => task.task_status === 'paused').forEach((task) =>
    uploader.resume(task)
  )
}
function pause_all() {
  group_by(selected_tasks.value, (task) => task.task_status === 'uploading').forEach((task) =>
    uploader.pause(task)
  )
}
function cancel_all() {
  selected_tasks.value.forEach((task) => uploader.cancel(task))
}

function group_by(list, predict) {
  result = []

  list.forEach((item) => {
    if (predict(item)) {
      result.push(item)
    }
  })

  return result
}

function statusDescription(task) {
  bytesPerMills(task)

  if (task.task_status === 'waiting') {
    return '等待中'
  } else if (task.task_status === 'uploading') {
    return sizeBeautify(task.speed) + '/s'
  } else if (task.task_status === 'paused') {
    return '已暂停'
  } else if (task.task_status === 'finished') {
    return '已完成'
  } else if (task.task_status === 'failed') {
    return '已失败'
  } else {
    return '未知状态'
  }
}

function bytesPerMills(task) {
  if (task.watch) {
    return
  }
  task.watch = true

  let last = task.progress
  task.speed = 200

  function update_time() {
    let now = task.progress
    task.speed = now - last
    last = now

    if (task.task_status != 'canceled') {
      setTimeout(update_time, 1000)
    }
  }

  setTimeout(update_time, 1000)
}

const files_to_upload = reactive([])

function handleSelectionTaskChange(val) {
  selected_tasks.value = val
}

mit.on('commit-task', (task) => {
  console.log(task)
  console.log(ref(task))
  ElMessage('commit-task' + task.file.name)
  files_to_upload.push(reactive(task))
})

onMounted(() => {
  let uploading_stores = window.store.get('uploading-list')
  if (uploading_stores) {
    uploading_stores.forEach((store) => {
      console.log(uploader.storeToTask(store))
      console.log(reactive(uploader.storeToTask(store)))
      files_to_upload.push(reactive(uploader.storeToTask(store)))
    })
  }
})
</script>

<style scoped>
.operation_show {
  visibility: hidden;
  display: flex;
}

.el-table__body tr:hover > td .operation_show {
  visibility: visible;
}

.no-border {
  border: 0;

  background-color: transparent;
}

.flex {
  display: flex;
  /* background: rgb(245, 245, 246); */
}

.concrete {
  flex: 0 1 auto;
}

.expand {
  flex: 1 0 0;
}
</style>
