import React from 'react';
import {
  Box,
  Flex,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
} from '@chakra-ui/react';

const Navbar = ({ user, onLogout }) => {
  return (
    <Box bg="gray.100" boxShadow="md" px={4} py={3}>
      <Flex justify="space-between" align="center">
        <Box>
          <Text color={'teal'} fontSize={'2rem'} fontWeight={'bold'} >My Calendar</Text>
        </Box>
        <Flex align="center">
          {user && (
            <Menu>
              <MenuButton as={Button} variant="ghost">
                <Avatar size="md" name={user.name} src={user.picture} />
              </MenuButton>
              <MenuList>
                <MenuItem>{user.name}</MenuItem>
                <MenuDivider />
                <MenuItem onClick={onLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
