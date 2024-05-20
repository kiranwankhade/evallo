import React from 'react';
import { Box, Button, Center, Heading, Text, VStack } from '@chakra-ui/react';

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'https://evallo-backend.onrender.com/auth/google';
  };

  return (
    <Center h="100vh" bgGradient="linear(to-right, #7879F1, #FF8533)">
        <VStack spacing={8}>
          <Heading>Welcome to Your Calendar App!</Heading>
          <Text fontSize="lg">Manage your events and stay organized.</Text>
          <Button variant="solid" colorScheme="blue" onClick={handleGoogleLogin}>
            Sign in with Google 
          </Button>
        </VStack>
      </Center>
  );
};

export default Login;
