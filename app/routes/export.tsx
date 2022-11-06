import { Box, Button, Center, Container, Link } from "@chakra-ui/react";
import { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { getAllLogs } from "~/models/log.server";

export default function () {
  return (
    <Container
      display={"flex"}
      flexDir="column"
      justifyContent={"center"}
      alignItems="center"
      px={0}
      py={16}
      h="100%"
    >
      <Center>
        <Button
          as={Link}
          isExternal
          href="/export/download"
          colorScheme={"teal"}
          size={"lg"}
          p={12}
        >
          导出数据
        </Button>
      </Center>
    </Container>
  );
}
