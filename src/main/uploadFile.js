import axios from 'axios'

export default function (event, filename, chunks) {
  axios
    .post('http://localhost:8088/trace', {
      filename,
      chunk: chunks[0]
    })
    .then((response) => {
      console.log(response)
    })
}
