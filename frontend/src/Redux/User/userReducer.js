import { SET_USER, LOGOUT_USER } from './userActions';

const initialState = {
  id: '',
  email:'',
  name: '',
  googleId: '',
  refreshToken: '',
  accessToken: '',
  tokenId: '',
  expiryDate: '',
  scope:''
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        ...action.payload,
      };
    case LOGOUT_USER:
      return initialState;
    default:
      return state;
  }
};

export default userReducer;
