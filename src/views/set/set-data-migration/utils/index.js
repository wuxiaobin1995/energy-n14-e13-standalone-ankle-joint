/*
 * @Author      : Mr.bin
 * @Date        : 2022-12-06 21:44:56
 * @LastEditTime: 2023-06-25 21:43:22
 * @Description : 导出文件方法
 */

const Tools = {
  /**
   * @description: 导出文件
   * @param {String} fileName 文件保存名称，如 'game.txt'、'text.json'、'demo.xlsx'等等
   * @param {*} data
   */
  outputFile(fileName, data) {
    /* 创建隐藏的可下载链接 */
    const link = document.createElement('a')
    link.download = fileName // 设置下载的默认文件名
    link.style.display = 'none'
    /* 字符内容转变成blob地址 */
    const blob = new Blob([data]) // 创建 blob 对象
    link.href = URL.createObjectURL(blob) // 创建一个 URL 对象并传给 a 的 href
    /* 触发点击 */
    link.click()
  }
}

export default Tools
