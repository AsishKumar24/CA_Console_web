import axios from 'axios'
import { BASE_URL } from '../utils/constants'

export const logout = async () => {
  return axios.post(
    BASE_URL + '/auth/logout',
    {},
    {
      withCredentials: true // IMPORTANT: clears HttpOnly cookie
    }
  )
}
