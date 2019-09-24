/**
 * 搜索相关接口模块
 */

import request from '@/utils/request'

/**
 * 获取联想建议
 */
export const getSearchSuggestions = q => {
  return request({
    method: 'GET',
    url: '/app/v1_0/suggestion',
    params: {
      q
    }
  })
}

/**
 * 获取搜索结果
 */
export const getSearch = ({
  q,
  page = 1,
  perPage = 10
}) => {
  return request({
    method: 'GET',
    url: '/app/v1_0/search',
    params: {
      q, // 搜索关键字
      page, // 页码
      per_page: perPage // 每页大小
    }
  })
}
