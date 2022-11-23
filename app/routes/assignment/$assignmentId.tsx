import { Container } from '@chakra-ui/react';

import { Outlet } from '@remix-run/react';

export default function Index() {
  return (
    <Container h="full" overflowY={'auto'} overflowX={'hidden'}>
      <Outlet />
    </Container>
  );
}
