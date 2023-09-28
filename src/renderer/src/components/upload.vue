<template>
  <el-upload class="upload-demo" drag action="" multiple :http-request="updateFile">
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
    <template #tip>
      <div class="el-upload__tip">jpg/png files with a size less than 500kb</div>
    </template>
  </el-upload>
  <el-progress :percentage="(progress * 100) / total" />
</template>

<script setup>
import { ElMessage } from 'element-plus'
import server from '../js/request.js'
import { ref } from 'vue'
import bus from '../js/event'

const CHUNK_SIZE = 1024 * 1024 * 2
const CUT_THREAD_COUNT = 8
const UPLOAD_THREAD_COUNT = 8

const MAX_TRY_COUNT = 8

const progress = ref(0)
const total = ref(0)

async function updateFile(params) {
  let file = params.file
  bus.emit('upload-file', file)
  total.value = file.size
  progress.value = 0
  var chunks = await cutFile(file)
  console.log(chunks)

  if (await upload(file, chunks)) {
    console.log('upload over')
    server.post('/file/merge/' + file.name)
  } else {
    ElMessage('upload fail')
  }
}

async function upload(file, chunks) {
  var index = chunks.length - 1

  function getIndex() {
    return index--
  }

  let proms = []
  for (let i = 0; i < UPLOAD_THREAD_COUNT; i++) {
    proms.push(recursiveUpload(getIndex, file, chunks, -1))
  }

  for (let i = 0; i < proms.length; ++i) {
    let success = await proms[i]
    if (!success) {
      return false
    }
  }

  return true
}

function recursiveUpload(getIndex, file, chunks, error_index = -1, try_count = 0) {
  return new Promise((resolve) => {
    let cur_index = error_index
    if (cur_index < 0) {
      cur_index = getIndex()
      if (cur_index < 0) {
        resolve(true)
        return
      }
    } else if (try_count > MAX_TRY_COUNT) {
      resolve(false)
      return
    }

    let chunk = chunks[cur_index]
    let chunk_size = chunk.end - chunk.start
    console.log('axios' + cur_index + ' with length' + chunk_size)

    let slicee = file.slice(chunk.start, chunk.end)
    let filename = file.name
    let form = new FormData()

    let last_progress = 0
    form.append('fileName', filename)
    form.append('checkSum', chunk.hash)
    form.append('chunkNum', cur_index)
    form.append('chunk', new File([slicee], filename))
    form.append('totalChunkNum', chunks.length)
    console.log(slicee)
    server
      .post('/file', form, {
        onUploadProgress: (e) => {
          last_progress = e.loaded
          if (e.loaded === e.total) {
            progress.value += e.total
          } else {
            progress.value = progress.value - last_progress + e.loaded
          }
        }
      })
      .then(async (response) => {
        console.log('axios', cur_index, 'over', response)
        resolve(await recursiveUpload(getIndex, file, chunks))
      })
      .catch(async (error) => {
        console.log('axios', cur_index, 'error', error)

        resolve(await recursiveUpload(getIndex, file, chunks, cur_index, try_count + 1))
      })
  })
}

function cutFile(file) {
  return new Promise((resolve) => {
    var chunks = []
    var finishCount = 0

    let chunk_count = Math.ceil(file.size / CHUNK_SIZE)

    let chunk_per_thread = Math.ceil(chunk_count / CUT_THREAD_COUNT)
    const total_thread_count = Math.ceil(chunk_count / chunk_per_thread)

    for (let i = 0; i < total_thread_count; i++) {
      let start = i * chunk_per_thread
      let end = Math.min(start + chunk_per_thread, chunk_count)
      if (start >= end) {
        break
      }

      const worker = new Worker('/src/js/cutfile.worker.js', {
        type: 'module'
      })

      worker.onmessage = (e) => {
        for (let i = start; i < end; ++i) {
          chunks[i] = e.data[i - start]
        }
        worker.terminate()
        finishCount++

        if (finishCount == total_thread_count) {
          resolve(chunks)
        }
      }

      worker.postMessage({
        file,
        start,
        end,
        size: CHUNK_SIZE
      })
    }
  })
}
</script>
