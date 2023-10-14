<template>
  <div class="folder" :class="{ selected: props.selected }" @click="OnFolderClicked">
    <img class="center file-img" :src="getImgUrl(props.file.type)" />
    <div class="file-title">{{ props.file.name }}</div>
    <div class="file-time">{{ timestampFormat(props.file.update_time) }}</div>
    <el-checkbox
      v-if="props.selected"
      @click.prevent
      class="file-check"
      v-model="props.selected"
    ></el-checkbox>
  </div>
</template>

<script setup>
const props = defineProps(['file', 'selected'])
const emit = defineEmits(['change'])

function OnFolderClicked(event) {
  emit('change', props.file, event)
}

function getImgUrl(filetype) {
  switch (filetype) {
    case 'folder':
      return '/src/assets/folder.png'
    case 'file':
      return '/src/assets/file.png'
    default:
      return '/src/assets/file.png'
  }
}

function timestampFormat(timestamp) {
  const date = new Date(timestamp)
  //example 03/07 17:20
  return (
    (date.getMonth() + 1).toString().padStart(2, '0') +
    '/' +
    date.getDate().toString().padStart(2, '0') +
    ' ' +
    date.getHours().toString().padStart(2, '0') +
    ':' +
    date.getMinutes().toString().padStart(2, '0')
  )
}
</script>

<style scoped>
.file-check {
  position: absolute;
  top: 5px;
  left: 13px;
  border-radius: 25%;
}
.selected {
  background: rgb(236, 239, 255);
}
.folder {
  width: 120px;
  display: inline-flex;
  flex-direction: column;
  padding: 10px;
  border-radius: 5%;
  position: relative;
}

.folder:hover:not(.selected) {
  background: rgb(245, 245, 246);
}

.center {
  margin: auto;
}

.file-time {
  text-align: center;
  font-size: 11px;
}

.file-title {
  text-align: center;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 5px;
}

.file-img {
  width: 100px;
}

.checkbox {
  position: absolute;
  top: 5px;
  left: 5px;
}
</style>
