import { createSlice } from '@reduxjs/toolkit'
import { IUserInfoSlice } from '../../types/slices'
import { IStore } from '../../types/store'

const initialState: IUserInfoSlice = {
    username: null
}

export const userInfoSlice = createSlice({
  name: 'UserInfo',
  initialState,
  reducers: {
    resetUsername: () => initialState,
    setUsername: (state, action) => {
      console.log("graceal1 in setUsername function in redux/userInfoSlice and setting to");
      console.log(action.payload);
      state.username = action.payload
    },
  },
})

// Actions
export const userInfoActions = userInfoSlice.actions

// Selector
export const selectUserInfo = (state: IStore): IUserInfoSlice => state.UserInfo

export default userInfoSlice.reducer
