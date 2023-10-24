<template>
  <div @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp">
    <ul class="file-grid">
      <li class="file-item" v-for="file in props.filelist">
        <folder
          :selected="isSelect(file)"
          :file="file"
          :data-file="file"
          @change="OnFolderSelectChange"
          @dblclick="OnDbClickFile(file)"
          @contextmenu="OnOpenContextMenu(file)"
          class="selector_find"
        ></folder>
      </li>

      <li class="file-item">
        <el-upload
          class="upload-demo"
          drag
          multiple
          :http-request="updateFile"
          :show-file-list="false"
        >
          <el-icon class="el-icon--upload"><Plus /></el-icon>
        </el-upload>
      </li>
    </ul>
  </div>
</template>

<script setup>
import folder from './folder.vue'
import { ElMessage, ElNotification } from 'element-plus'
import mit from '../js/event'
import { Plus } from '@element-plus/icons-vue'
import uploader from '../js/uploader'
import server from '../js/request'

const props = defineProps({
  selectlist: Array,
  filelist: Array,
  sort: Function
})

const emit = defineEmits(['selected-change', 'update:selectlist', 'on-request'])

function isSelect(file) {
  return props.selectlist.indexOf(file) != -1
}

function OnFolderSelectChange(file, event) {
  var selectlist_copy = [...props.selectlist]

  const index = selectlist_copy.indexOf(file)
  if (event.ctrlKey) {
    index == -1 ? selectlist_copy.push(file) : selectlist_copy.splice(index, 1)
  } else {
    index == -1 || selectlist_copy.length > 0 ? (selectlist_copy = [file]) : (selectlist_copy = [])
  }

  emit('update:selectlist', selectlist_copy)
}

function updateFile(fileholder) {
  let file = fileholder.file

  emit('on-request', file)

  var notification = ElNotification.success({
    title: file.name + '成功添加到上传队列'
  })

  setTimeout(() => {
    notification.close()
  }, 800)
}

function OnDbClickFile(file) {
  //TODO:
  console.log(file)
  server
    .post(
      '/file/' + file.id,
      {
        from: 0,
        to: file.chunknum
      },
      {
        responseType: 'arraybuffer'
      }
    )
    .then((response) => {
      console.log(response.data)
      window.fs.write(file.name, response.data)
    })

  if (file.is_folder) {
    ElMessage('getfilelist' + file.path + file.name)
    mit.emit('getfilelist', file.path + file.name)
  } else {
  }
}

function OnOpenContextMenu(file) {
  ElMessage('opencontextmenu' + file.name)
}

let isSelecting = false
let startX = false
let startY = false
let endX = false
let endY = false

function handleMouseDown(event) {
  isSelecting = true
  startX = event.clientX
  startY = event.clientY
  endX = event.clientX
  endY = event.clientY
}

function handleMouseMove(event) {
  if (isSelecting) {
    endX = event.clientX
    endY = event.clientY
  }
}
function handleMouseUp() {
  isSelecting = false
  emit('update:selectlist', findSelectedItems())
}
function findSelectedItems() {
  const selected = []
  const elements = document.querySelectorAll('.selector_find')
  for (const element of elements) {
    const rect = element.getBoundingClientRect()
    if (rect.left < endX && rect.right > startX && rect.top < endY && rect.bottom > startY) {
      const file = element.getAttribute('data-file')
      selected.push(file)
    }
  }
  return selected
}
function clearSelection() {
  selectedItems = []
}
</script>

<style>
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  grid-gap: 20px;
  padding: 10px;
}

.file-item {
  width: 120px;
  display: grid;
  padding: 10px;
  border-radius: 5%;
}

/* .upload {
  border: 1px dashed #409eff;
  border-radius: 5%;
  width: 100%;
  height: 100%;
}

.full {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  font-size: 50px;
  color: #409eff;
  text-align: center;
  line-height: 100%;
  border-radius: 5%;
  margin: auto;
  padding: auto;
} */
</style>
