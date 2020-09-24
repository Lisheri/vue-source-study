const path = require('path')
//? path.resolve()第一个参数表示第一层的目录，__dirname表示当前目录，第二个参数表示在当前目录的基础上去找
// * 此处就是从scripts目录往上一级的目录下开始寻找 p 所指代的路径中的文件
const resolve = p => path.resolve(__dirname, '../', p)

// * 所以这个alias提供了一个键名到他真实文件路径的一个映射关系，通过简单的key值去获取
module.exports = {
  vue: resolve('src/platforms/web/entry-runtime-with-compiler'),
  compiler: resolve('src/compiler'),
  core: resolve('src/core'),
  shared: resolve('src/shared'),
  web: resolve('src/platforms/web'),
  weex: resolve('src/platforms/weex'),
  server: resolve('src/server'),
  sfc: resolve('src/sfc')
}
