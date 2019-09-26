/**
 * 专门处理时间的功能模块
 */
import dayjs from 'dayjs'
import rTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

// 配置使用中文
dayjs.locale('zh-cn')

// 注册使用相对时间插件
dayjs.extend(rTime)

export const relativeTime = dateTime => {
  return dayjs().from(dayjs(dateTime))
}

// console.log(dayjs().format('YYYY/MM-DD'))
// console.log(dayjs().from(dayjs('2019-9-21 14:54:09')))
// console.log(dayjs().from(dayjs(), true))

// const dayjs = require('dayjs')
// const relativeTime = require('dayjs/plugin/relativeTime')
// require('dayjs/locale/zh-cn')

// // 配置使用中文
// dayjs.locale('zh-cn')

// // 注册使用相对时间插件
// dayjs.extend(relativeTime)

// console.log(dayjs().format('YYYY/MM-DD'))
// console.log(dayjs().from(dayjs('2019-9-21 14:54:09')))
// console.log(dayjs().from(dayjs(), true))
