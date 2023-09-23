<template>
  <el-upload class="upload-demo" drag action="" multiple :http-request="updateFile">
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
    <template #tip>
      <div class="el-upload__tip">jpg/png files with a size less than 500kb</div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
const CHUNK_SIZE = 1024 * 1024 * 4
const CUT_THREAD_COUNT = 8

async function updateFile(params) {
  let file = params.file
  var chunks = await cutFile(file)

  console.log(file)

  window.electronAPI.uploadFile(file.name, chunks)

  // axios
  //   .post('https://localhost:8088/trace', {
  //     filename: file.name,
  //     chunk: chunks[0]
  //   })
  //   .then((response) => {
  //     console.log(response)
  //   })
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

      const worker = new Worker('src/js/FileCutWorker.js', {
        type: 'module'
      })

      worker.postMessage({
        file,
        start,
        end,
        size: CHUNK_SIZE
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
    }
  })
}
</script>
