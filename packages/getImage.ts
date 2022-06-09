const download = require('download')

// Url of the image
const file = 'GFG.jpeg'
// Path at which image will get downloaded
const filePath = `${__dirname}/files`

download(file, filePath).then(() => {
  console.log('Download Completed')
})