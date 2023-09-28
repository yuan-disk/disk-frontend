/**
 *  description: 下载文件到指定目录
 *  param {string} url 文件下载链接
 *  param {string} fileName 文件名称
 *  param {string} fileType 文件格式
 *  author: longyunfei
 */

function downloadFileToFolder(url, fileName, fileType) {
  mainWindow.webContents.downloadURL(url)
  mainWindow.webContents.session.once('will-download', (event, item, webContents) => {
    //设置保存路径
    const filePath = path.join(app.getAppPath(), '/download', `${fileName}.${fileType}`)
    item.setSavePath(filePath)
    // item.on('updated', (event, state) => {
    //   if (state === 'interrupted') {
    //     console.log('下载中断，可以继续');
    //   } else if (state === 'progressing') {
    //     if (item.isPaused()) {
    //       console.log('下载暂停');
    //     } else {
    //       console.log(`当前下载项目的接收字节${item.getReceivedBytes()}`);
    //       console.log(`下载完成百分比：${item.getReceivedBytes() / item.getTotalBytes() * 100}`);
    //     }
    //   }
    // });
    item.once('done', (event, state) => {
      if (state === 'completed') {
        shell.openPath(filePath) //打开文件
      }
    })
  })
}

//将流转换为下载地址
function getDownLoadUrl(data) {
  const blob = new Blob([data])
  return window.URL.createObjectURL(blob)
}

export { downloadFileToFolder, getDownLoadUrl }
