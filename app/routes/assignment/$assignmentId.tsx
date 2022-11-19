import { Container } from "@chakra-ui/react";

import { Outlet } from "@remix-run/react";

export default function Index() {
  return (
    <Container h="100%">
      <Outlet />
    </Container>
  );
}
