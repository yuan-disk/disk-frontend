import { ElMessage } from 'element-plus'
import server from './request.js'
import { uploadFile } from './upload.js'
import mit from './event.js'

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

    // resumeFromStore()
    let list = window.store.get('uploading-list')
    if (list) {
      for (let i = 0; i < list.length; ++i) {
        let task = this.storeToTask(list[i])
        this.unrunning_tasks.push(task)
      }
    }
  }

  commit(file, name, parentid) {
    let task = {
      name: name,
      file: file,
      path: file.path,
      task_status: 'waiting',
      progress: 0,
      size: file.size,
      parentid: parentid
    }

    this.onCommitTask(task)
    return task
  }

  pause(task) {
    ElMessage('pause')
    console.log(task)
    task.task_status = 'paused'
    let index = this.running_tasks.indexOf(task)
    if (index >= 0) {
      this.running_tasks.splice(index, 1)
      this.unrunning_tasks.push(task)
    }

    if (task.controller) {
      task.controller.abort()
    }
    this.runWaitingTasks(1)
  }

  cancel(task) {
    ElMessage('cancel')

    task.task_status = 'canceled'

    if (task.controller) {
      task.controller.abort()
    }

    let index = this.unrunning_tasks.indexOf(task)
    if (index >= 0) {
      this.unrunning_tasks.splice(index, 1)
    } else {
      index = this.running_tasks.indexOf(task)
      if (index >= 0) {
        this.running_tasks.splice(index, 1)
      }
    }

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

    let index = this.unrunning_tasks.indexOf(task)
    if (index >= 0) {
      this.unrunning_tasks.splice(index, 1)
    }
    this.running_tasks.push(task)
    uploadFile(this.server, this.url, task).then(() => {
      this.onTaskOver(task)
    })
  }

  onCommitTask(task) {
    window.store.add('uploading-list', this.taskToStore(task))

    mit.emit('commit-task', task)

    this.unrunning_tasks.push(task)
    if (this.running_tasks.length < this.max_allow) {
      this.setUploading(task)
    }
  }

  onTaskOver(task) {
    window.store.remove('uploading-list', this.taskToStore(task))

    let index = this.running_tasks.indexOf(task)
    this.running_tasks.splice(index, 1)
    this.runWaitingTasks(1)
  }

  onTaskPause(task) {}

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

  taskToStore(task) {
    return {
      path: task.path,
      parentid: task.parentid,
      name: task.file.name,
      lastModified: task.file.lastModified
    }
  }

  storeToTask(store) {
    return {
      file: window.fs.getFile(store.path, store.name, store.lastModified),
      path: store.path,
      task_status: 'paused',
      progress: 0,
      size: 0,
      parentid: store.parentid,
      name: store.name
    }
  }
}

const uploader = new Uploader(server, '/file', 1)

export default uploader
