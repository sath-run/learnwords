import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  Link as RemixLink,
  useParams,
} from "@remix-run/react";
import { BsQuestion } from "react-icons/bs";
import { FiCheck, FiX } from "react-icons/fi";
import { httpResponse } from "~/http";
import { AddLog } from "~/models/log.server";
import { requireUserName } from "~/session.server";
import { data } from "./data.server";
import invariant from "tiny-invariant";

export const loader = async ({ request, params }: LoaderArgs) => {
  let userName = await requireUserName(request);
  let { taskId } = params;
  let id = Number(taskId);
  let d = data[id];
  if (!d) {
    throw httpResponse.BadRequest;
  }
  return json(d);
};

export const action = async ({ request, params }: ActionArgs) => {
  let { taskId } = params;
  let id = Number(taskId);

  if (id < 0 || id >= data.length) {
    return httpResponse.BadRequest;
  }

  let userName = await requireUserName(request);
  let formData = await request.formData();
  let action = formData.get("_action") as string | null;
  let answer = formData.get("answer") as string | null;
  let userAgent = request.headers.get("user-agent");

  if (!action) {
    return httpResponse.BadRequest;
  }

  await AddLog({
    userName: userName,
    action: action,
    userAgent: userAgent ?? "",
    taskNumber: id,
    answer: answer ?? "",
    question: data[id].question,
    example: data[id].example,
  });

  if (id === data.length - 1) {
    return redirect("/finish");
  } else {
    return redirect(`/tasks/${id + 1}`);
  }
};

export default function () {
  let data = useLoaderData<typeof loader>();
  let { taskId } = useParams();
  invariant(taskId);
  return (
    <Container
      display={"flex"}
      flexDir="column"
      justifyContent={"space-between"}
      textAlign={"center"}
      alignItems="center"
      px={0}
      py={16}
      h="100%"
    >
      <Heading fontFamily={"cursive"} mb={4}>
        {data.question}
      </Heading>
      <Flex>
        <video width="100%" height={"auto"} controls autoPlay loop>
          <source src={data.videoUrl} type="video/mp4" />
        </video>
      </Flex>
      <Box>
        <Heading size="md" mb={4}>
          请根据视频判断以下句子是否正确
        </Heading>
        <Text
          fontSize={"3xl"}
          py={6}
          borderWidth={2}
          borderRadius="3xl"
          borderColor={"yellow"}
          w={"360px"}
          maxW="full"
          letterSpacing="12px"
          color={"yellow"}
        >
          {data.example}
        </Text>
      </Box>
      <Flex
        fontSize={"lg"}
        textAlign={"center"}
        justifyContent={"space-between"}
        px={4}
        w="360px"
        color={"blue.500"}
        as={Form}
        method="post"
      >
        <Box>
          <Button
            borderRadius={"3xl"}
            colorScheme={"green"}
            mt={2}
            p={4}
            h="auto"
            type="submit"
            name="_action"
            value="correct"
          >
            <Icon w={8} h={8} as={FiCheck} />
          </Button>
          <Text mt={0.5} background={"whiteAlpha.700"} borderRadius="md">
            正确
          </Text>
        </Box>
        <Box>
          <Button
            borderRadius={"3xl"}
            colorScheme={"red"}
            mt={2}
            p={4}
            h="auto"
            as={RemixLink}
            to={`/tasks/${taskId}/corrections`}
          >
            <Icon w={8} h={8} as={FiX} />
          </Button>
          <Text mt={0.5} background={"whiteAlpha.700"} borderRadius="md">
            错误
          </Text>
        </Box>
        <Box>
          <Button
            borderRadius={"3xl"}
            colorScheme={"yellow"}
            mt={2}
            p={4}
            h="auto"
            type="submit"
            name="_action"
            value="unsure"
          >
            <Icon w={8} h={8} as={BsQuestion} />
          </Button>
          <Text mt={0.5} background={"whiteAlpha.700"} borderRadius="md">
            不确定
          </Text>
        </Box>
      </Flex>
    </Container>
  );
}
