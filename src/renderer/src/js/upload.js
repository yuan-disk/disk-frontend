const CHUNK_SIZE = 1024 * 1024 * 2
const CUT_THREAD_COUNT = 8
const UPLOAD_THREAD_COUNT = 8

const MAX_TRY_COUNT = 8

export async function uploadFile(server, url, task, onTaskOver) {
  return new Promise(async (resolve, error) => {
    if (!task.chunked) {
      task.chunks = await cutFile(task.file)
      task.success_chunks = []

      task.controller = new AbortController()
      task.chunked = true
    }

    const success = await upload(server, url, task)

    if (success) {
      console.log('upload over')
      onTaskOver(task)
      resolve()
    } else {
      error()
    }
  })
}

async function upload(server, url, task) {
  var index = task.chunks.length - 1

  function getIndex() {
    return index--
  }

  let proms = []
  for (let i = 0; i < UPLOAD_THREAD_COUNT; i++) {
    proms.push(recursiveUpload(server, url, getIndex, task, -1))
  }

  for (let i = 0; i < proms.length; ++i) {
    let success = await proms[i]
    if (!success) {
      return false
    }
  }

  return true
}

function recursiveUpload(server, url, getIndex, task, error_index = -1, try_count = 0) {
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

    let file = task.file

    let chunk = task.chunks[cur_index]
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
    form.append('totalChunkNum', task.chunks.length)

    let progress = 0

    server
      .post(url, form, {
        signal: task.controller.signal,

        onUploadProgress: (e) => {
          const { loaded, total } = e

          task.progress -= last_progress
          last_progress = loaded

          if (loaded < total) {
            task.progress += last_progress
          }
        }
      })
      .then(async (response) => {
        console.log('axios', cur_index, 'over', response)

        task.progress += chunk_size
        task.success_chunks.push(cur_index)

        resolve(await recursiveUpload(server, url, getIndex, task))
      })
      .catch(async (error) => {
        console.log('axios', cur_index, 'error', error)

        resolve(await recursiveUpload(server, url, getIndex, task, cur_index, try_count + 1))
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
