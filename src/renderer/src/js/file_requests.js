import server from './request'

const folderFileType = 'directory.a'

export async function getFileList(basepath) {
  if (basepath === '/') {
    basepath = ''
  }

  let result = []

  let response = await server.get('/file/list/' + basepath)
  console.log(response)
  let data = response.data.data

  let filelist = data.files.files
  for (let i = 0; i < filelist.length; i++) {
    result.push(format(filelist[i]))
  }

  let parentid = data.files.directory.id

  return {
    result,
    parentid
  }
}

function format(file) {
  return {
    name: file.fileName,
    update_time: file.createAt,
    type: file.fileType,
    is_folder: file.fileType === folderFileType ? 1 : 0,

    id: file.id,
    chunknum: file.chunkKeys.length
  }
}
