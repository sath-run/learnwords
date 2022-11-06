import { Box, Button, Container, Heading, Text } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { useUserName } from "~/hooks";

export default function () {
  let userName = useUserName();
  return (
    <Container
      display={"flex"}
      flexDir="column"
      justifyContent={"space-between"}
      alignItems="center"
      px={0}
      py={16}
      h="100%"
    >
      <Heading>
        恭喜你:{" "}
        <Text color={"yellow"} as="span">
          {userName}
        </Text>
        <br />
        你已经完成了所有游戏
      </Heading>
      <Button to="/" as={Link} p={8} size="lg" colorScheme={"teal"}>
        再玩一次
      </Button>
    </Container>
  );
}
