import React from 'react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Button } from '@chakra-ui/react';

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/auth/google';
  };
  // const handleGoogleLogin = useGoogleLogin({
  //   onSuccess: codeResponse => console.log(codeResponse),
  //   flow: 'auth-code',
  // });

  return (
    <div>
      {/* <GoogleOAuthProvider clientId="631939001619-atr5rvj2fi1q7olf01ot92isic5dkrjd.apps.googleusercontent.com"> */}
          <Button onClick={handleGoogleLogin}>Sign in with Google 🚀</Button>
      {/* </GoogleOAuthProvider> */}
    </div>
  );
};

export default Login;
