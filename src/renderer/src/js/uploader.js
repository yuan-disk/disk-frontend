import server from './request.js'
import { uploadFile } from './upload.js'

class Uploader {
  /**
   *
   * @param {axios} server
   * @param {string} url
   * @param {int} max_allow
   */
  constructor(server, url, max_allow = 1) {
    this.server = server
    this.url = url
    this.max_allow = max_allow

    this.running_tasks = []
    this.unrunning_tasks = []
  }

  commit(file) {
    let task = {
      file: file,
      task_status: 'waiting',
      progress: 0,
      size: file.size
    }

    if (this.running_tasks.length < this.max_allow) {
      this.setUploading(task)
    }

    this.unrunning_tasks.push(task)
    return task
  }

  pause(task) {
    task.task_status = 'paused'
    task.controller.abort()
    this.runWaitingTasks(1)
  }

  resume(task) {
    task.task_status = 'waiting'
    if (this.running_tasks.length < this.max_allow) {
      this.setUploading(task)
    }
  }

  setUploading(task) {
    task.task_status = 'uploading'
    this.running_tasks.push(task)
    uploadFile(this.server, this.url, task, this.onTaskOver)
  }

  onTaskOver(task) {
    let index = this.running_tasks.indexOf(task)
    this.running_tasks.splice(index, 1)
    this.runWaitingTasks(1)
  }

  runWaitingTasks(count) {
    let cur_count = 0
    for (let i = 0; i < this.unrunning_tasks.length; ++i) {
      let task = this.unrunning_tasks[i]
      if (task.task_status == 'waiting') {
        this.setUploading(task)
        cur_count++

        if (cur_count >= count) {
          break
        }
      }
    }
  }
}

const uploader = new Uploader(server, '/upload', 1)

// data = uploader.commit(file)
// uploader.pause(data)
// uploader.resume(data)
// uploader.cancel(data)

// uploader.onCommit = (file_upload_data) => {
//   file_uploading.push(file_upload_data)
// }

// uploader.onProgress(file_upload_data, (progress) => {})

export default uploader
