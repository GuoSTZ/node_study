const download = require('download')

export const downloadImage = (file: string, path: string, name?: string) => {
  download(file, path, {filename: `${name}.png`}).then(() => {
    console.log(`${name ?? "file"} 下载完成`)
  })
}