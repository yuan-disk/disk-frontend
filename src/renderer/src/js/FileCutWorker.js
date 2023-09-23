import SparkMD5 from 'spark-md5'

onmessage = async (e) => {
  const { file, start, end, size } = e.data

  const proms = []
  for (let i = start; i < end; i++) {
    proms.push(createChuck(file, i, size))
  }

  const chunks = await Promise.all(proms)
  postMessage(chunks)
}

async function createChuck(file, index, size) {
  return new Promise((resolve) => {
    const start = index * size
    const end = Math.min(start + size, file.size)
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      spark.append(e.target.result)
      resolve({
        start,
        end,
        index,
        hash: spark.end(),
        binary: e.target.result
      })
    }

    fileReader.readAsBinaryString(file.slice(start, end))
  })
}
