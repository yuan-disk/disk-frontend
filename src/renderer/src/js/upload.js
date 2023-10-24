import net_status from './status_code'
import server from './request'

const CHUNK_SIZE = 1024 * 1024 * 2
const CUT_THREAD_COUNT = 8
const UPLOAD_THREAD_COUNT = 8

const MAX_TRY_COUNT = 8

async function precheck(task) {
  let precheck_data = {
    keys: [],
    filename: task.file.name,
    fileSize: task.file.size,
    parentId: task.parentid
  }

  task.chunks.forEach((element) => {
    precheck_data.keys.push(element.hash)
  })

  let response = await server.post('/file/precheck', precheck_data)

  if (response.data && response.data.data.code === net_status.success) {
    task.success_chunks = response.data.data.uploaded
  }

  return response.data.code
}

export async function uploadFile(server, url, task) {
  return new Promise(async (resolve, reject) => {
    if (!task.chunked) {
      task.chunks = await cutFile(task.file)
      task.success_chunks = []

      task.controller = new AbortController()
      task.chunked = true
    }

    if (task.task_status == 'paused') {
      reject()
      return
    }

    while (true) {
      let code = await precheck(task)

      if (code === net_status.file_uploaded) {
        resolve()
        return
      } else if (code !== net_status.success) {
        reject()
        return
      }

      let success = await upload(server, url, task)

      if (success) {
        resolve()
      } else {
        reject()
      }

      return
    }
  })
}

async function upload(server, url, task) {
  var index = task.chunks.length - 1

  function getIndex() {
    while (task.success_chunks.includes(index)) {
      index--
    }
    return index--
  }

  let proms = []
  for (let i = 0; i < UPLOAD_THREAD_COUNT; i++) {
    proms.push(recursiveUpload(server, url, getIndex, task, -1))
  }

  for (let i = 0; i < proms.length; ++i) {
    let success = await proms[i]
    if (success) {
      return true
    }
  }

  return false
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

    form.append('fileName', filename)
    form.append('checkSum', chunk.hash)
    form.append('chunk', new File([slicee], filename))

    let last_progress = 0

    server
      .post(url, form, {
        signal: task.controller.signal,

        onUploadProgress: (e) => {
          const { loaded, total } = e
          console.log(e, Date.now())
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

        if (response.data.data.code === net_status.file_upload_over) {
          resolve(true)
          return
        }

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
