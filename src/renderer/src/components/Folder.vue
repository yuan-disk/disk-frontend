<template>
  <el-button @click="download">下载</el-button>
  <p style="text-wrap: wrap">{{ token }}</p>
</template>

<script setup>
import server from '../js/request'

const token = window.store.ipcRenderer.get('token')

const file = {
  id: '651449510b5128468439a475',
  fileName: '懒羊羊睡觉有窗户电脑4K壁纸_彼岸图网.jpg',
  fileType: 'txt',
  chunks: [
    {
      num: '0',
      key: 'd8b08d65c314431f0db186eec589a864',
      size: '1662837'
    }
  ],
  size: '1662837',
  createAt: '1695822717821'
}

function download() {
  console.log('download')
  server
    .post(
      '/file/' + file.id,
      { from: 0, to: file.chunks.length },
      {
        responseType: 'arraybuffer'
      }
    )
    .then((response) => {
      console.log(response)
      console.log(response.data.size)
      window.core.writeFileByArrayBuffer(file.fileName, response.data)
    })
}
</script>
