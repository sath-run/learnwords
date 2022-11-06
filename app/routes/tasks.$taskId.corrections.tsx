import {
  Box,
  BoxProps,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react";
import { Form, Link, useLoaderData, useParams } from "@remix-run/react";
import { ReactNode } from "react";
import { loader, action } from "./tasks.$taskId";
import { ImArrowRight, ImArrowLeft } from "react-icons/im";
import invariant from "tiny-invariant";

export { loader, action };

const Carriage = ({
  children,
  bg,
  ...rest
}: {
  children: ReactNode;
} & BoxProps) => {
  let radius = 10;
  return (
    <Box {...rest}>
      <Text fontSize={"xl"} borderRadius={"sm"} bg={bg} py={2} width="60px">
        {children}
      </Text>
      <Flex justifyContent={"space-evenly"}>
        <Box
          marginTop={`-${radius}px`}
          bg={bg}
          height={`${radius * 2}px`}
          width={`${radius * 2}px`}
          borderBottomLeftRadius="full"
          borderBottomRightRadius="full"
        />
        <Box
          marginTop={`-${radius}px`}
          bg={bg}
          height={`${radius * 2}px`}
          width={`${radius * 2}px`}
          borderBottomLeftRadius="full"
          borderBottomRightRadius="full"
        />
      </Flex>
    </Box>
  );
};

export default function () {
  let data = useLoaderData<typeof loader>();
  let { taskId } = useParams();
  invariant(taskId);
  return (
    <Box
      backgroundImage={"/bg.jpg"}
      backgroundSize="cover"
      backgroundPosition={"center"}
      color="white"
      as={Form}
      method="post"
    >
      <Container
        display={"flex"}
        flexDir="column"
        justifyContent={"space-between"}
        textAlign={"center"}
        alignItems="center"
        px={2}
        py={16}
        h="100vh"
      >
        <Heading color="teal.50" px={2} size={"md"} lineHeight="8">
          你认为
          <Text color={"yellow"} as="strong" fontWeight={"bold"}>
            {data.example}
          </Text>
          不正确
          <br />
          请你拖一拖小火车，连成一句正确的话
          <br />
          你必须用上"□"里的小火车。
          <br />
          请注意，这些可能不够用，你可以从"○"里选出你需要的小火车
        </Heading>
        <Flex
          px={1}
          py={6}
          borderWidth={2}
          borderRadius="md"
          w={"full"}
          justifyContent="space-evenly"
        >
          {data.initial.map((text) => (
            <Carriage bg="yellow.500" mx={0.5}>
              {text}
            </Carriage>
          ))}
        </Flex>
        <Flex
          px={1}
          py={16}
          borderWidth={2}
          borderRadius="50%"
          w={"full"}
          justifyContent="space-evenly"
        >
          {data.alternative.map((text) => (
            <Carriage bg="green.500" mx={0.5}>
              {text}
            </Carriage>
          ))}
        </Flex>
        <Flex justifyContent={"space-around"} w="full">
          <Button
            as={Link}
            to={`/tasks/${taskId}`}
            colorScheme={"blackAlpha"}
            size="lg"
          >
            <Icon as={ImArrowLeft} mr={2} />
            取消
          </Button>
          <Button
            name="_action"
            value="incorrect"
            colorScheme={"blue"}
            size="lg"
          >
            确认
            <Icon as={ImArrowRight} ml={2} />
          </Button>
        </Flex>
      </Container>
    </Box>
  );
}
