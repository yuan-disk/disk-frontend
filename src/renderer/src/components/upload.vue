<template>
  <el-upload class="upload-demo" drag action="" multiple :http-request="updateFile">
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
    <template #tip>
      <div class="el-upload__tip">jpg/png files with a size less than 500kb</div>
    </template>
  </el-upload>
</template>

<script setup>
import axios from 'axios'

const CHUNK_SIZE = 1024 * 1024 * 2
const CUT_THREAD_COUNT = 8
const UPLOAD_THREAD_COUNT = 8

async function updateFile(params) {
  let file = params.file
  var chunks = await cutFile(file)
  console.log(chunks)

  await upload(file, chunks)
  console.log('upload over')
  axios.post('http://119.23.244.10:9999/file/merge/' + file.name, '', {
    headers: {
      Authentication:
        'Barer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNzA0NjkzNTI0ODA3OTA1MjgxIiwiZXhwIjoxNjk4MDQzMTIxLCJpYXQiOjE2OTU0NTExMjF9.gcEwUtrw01WGAdbtCoZwVD5K8TgW05jrk56xtdh248Q'
    }
  })
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
  await Promise.all(proms)
}

function recursiveUpload(getIndex, file, chunks, error_index) {
  return new Promise((resolve) => {
    let cur_index = error_index
    if (cur_index < 0) {
      cur_index = getIndex()
      if (cur_index < 0) {
        resolve(undefined)
        return
      }
    }

    let chunk = chunks[cur_index]
    console.log('axios' + cur_index + ' with length' + (chunk.end - chunk.start))

    let slicee = file.slice(chunk.start, chunk.end)
    let filename = file.name
    let form = new FormData()
    form.append('checkSum', chunk.hash)
    form.append('chunkNum', cur_index)
    form.append('chunk', new File([slicee], filename))
    form.append('totalChunkNum', chunks.length)
    axios
      .post('http://119.23.244.10:9999/file/upload', form, {
        headers: {
          Authentication:
            'Barer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNzA0NjkzNTI0ODA3OTA1MjgxIiwiZXhwIjoxNjk4MDQzMTIxLCJpYXQiOjE2OTU0NTExMjF9.gcEwUtrw01WGAdbtCoZwVD5K8TgW05jrk56xtdh248Q'
        }
      })
      .then(async () => {
        console.log('axios', cur_index, 'over')
        await recursiveUpload(getIndex, file, chunks, -1)
        resolve(undefined)
      })
      .catch(async (error) => {
        console.log('axios', cur_index, 'error')
        console.log(error)

        await recursiveUpload(getIndex, file, chunks, cur_index)
        resolve(undefined)
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

      const worker = new Worker('src/js/FileCutWorker.js', {
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
