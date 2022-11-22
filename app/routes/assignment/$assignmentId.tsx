import { Container } from '@chakra-ui/react';

import { Outlet } from '@remix-run/react';

export default function Index() {
  return (
    <Container h="full" w="full" overflowY={'auto'} maxW={'100%'}>
      <Outlet />
    </Container>
  );
}
