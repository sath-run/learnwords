import {
  Box,
  Button, Center,
  Container,
  Flex,
  Heading,
  Icon, Image,
  Text,
} from '@chakra-ui/react';
import { ActionArgs, json, LoaderArgs, redirect } from '@remix-run/node';
import {
  Form,
  Link as RemixLink,
  useLoaderData,
  useNavigate,
  useParams,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import { BsQuestion } from 'react-icons/bs';
import { FiCheck, FiX } from 'react-icons/fi';
import invariant from 'tiny-invariant';
import { httpResponse } from '~/http';
import { AddLog } from '~/models/log.server';
import { getAssignmentWithTasks } from '~/models/task.server';
import { requireUserName } from '~/session.server';
import { TaskModel } from '~/models/type';

export const loader = async ({ params }: LoaderArgs) => {
  let assignmentId = Number(params.assignmentId);
  if (!assignmentId) {
    throw httpResponse.BadRequest;
  }
  let assignment = await getAssignmentWithTasks(assignmentId);
  if (!assignment) {
    throw httpResponse.BadRequest;
  }
  return json(assignment);
};

export const action = async ({ request, params }: ActionArgs) => {
  let { index } = params;
  let assignmentId = Number(params.assignmentId);
  if (!assignmentId) {
    return httpResponse.BadRequest;
  }
  const taskIndex = Number(index);
  const assignment = await getAssignmentWithTasks(assignmentId);

  if (!assignment) {
    return httpResponse.BadRequest;
  }

  let taskList = assignment.tasks;

  if (taskIndex < 0 || taskIndex >= taskList.length) {
    return httpResponse.BadRequest;
  }
  let userName = await requireUserName(request);
  let formData = await request.formData();
  let action = formData.get('_action') as string | null;
  let answer = formData.get('answer') as string | null;
  let userAgent = request.headers.get('user-agent');
  if (!action) {
    return httpResponse.BadRequest;
  }
  await AddLog({
    userName: userName,
    action: action,
    userAgent: userAgent ?? '',
    taskId: taskList[taskIndex].id,
    assignmentId: assignmentId,
    answer: answer ?? '',
    question: taskList[taskIndex].question,
    example: taskList[taskIndex].example,
  });

  if (taskIndex === taskList.length - 1) {
    return redirect(`/assignment/${assignmentId}/finish`);
  } else {
    return redirect(`/assignment/${assignmentId}/tasks/${taskIndex + 1}`);
  }
};

export default function () {
  const { index, assignmentId } = useParams();
  invariant(index);
  const assignment = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  let data = assignment.tasks[Number(index)];
  useEffect(() => {
    if (!data) {
      navigate(`/assignment/${assignmentId}/finish`, { replace: true });
    }
  }, []);

  if (!data) {
    return null;
  }

  return (
    <Container
      display={'flex'}
      flexDir="column"
      justifyContent={'space-between'}
      textAlign={'center'}
      alignItems="center"
      px={0}
      py={10}
      maxW={800}
    >
      {!data.imageUrl ? <NormalMode {...data} /> : <ImageMode {...data} />}
    </Container>
  );
}

const NormalMode = (data: TaskModel) => {
  const { index, assignmentId } = useParams();
  return (<><Heading fontFamily={'cursive'} mb={4}>
    {data.question}
  </Heading>
    <Flex>
      <video width="100%" height={'auto'} controls autoPlay loop>
        <source src={data.videoUrl} type="video/mp4" />
      </video>
    </Flex>

    <Box mt={10}>
      <Heading size="md" mb={5}>
        ?????????????????????????????????????????????
      </Heading>
      <Text
        fontSize={'3xl'}
        py={6}
        borderWidth={2}
        borderRadius="3xl"
        borderColor={'yellow'}
        w={'360px'}
        maxW="full"
        letterSpacing="12px"
        color={'yellow'}
      >
        {data.example}
      </Text>
    </Box>
    <Flex
      fontSize={'lg'}
      textAlign={'center'}
      justifyContent={'space-between'}
      px={4}
      py={5}
      w="360px"
      color={'blue.500'}
      as={Form}
      method="post"
    >
      <Box>
        <Button
          borderRadius={'3xl'}
          colorScheme={'green'}
          mt={2}
          p={4}
          h="auto"
          type="submit"
          name="_action"
          value="correct"
        >
          <Icon w={8} h={8} as={FiCheck} />
        </Button>
        <Text mt={0.5} background={'whiteAlpha.700'} borderRadius="md">
          ??????
        </Text>
      </Box>
      <Box>
        <Button
          borderRadius={'3xl'}
          colorScheme={'red'}
          mt={2}
          p={4}
          h="auto"
          as={RemixLink}
          to={`/assignment/${assignmentId}/tasks/${index}/corrections`}
        >
          <Icon w={8} h={8} as={FiX} />
        </Button>
        <Text mt={0.5} background={'whiteAlpha.700'} borderRadius="md">
          ??????
        </Text>
      </Box>
      <Box>
        <Button
          borderRadius={'3xl'}
          colorScheme={'yellow'}
          mt={2}
          p={4}
          h="auto"
          type="submit"
          name="_action"
          value="unsure"
        >
          <Icon w={8} h={8} as={BsQuestion} />
        </Button>
        <Text mt={0.5} background={'whiteAlpha.700'} borderRadius="md">
          ?????????
        </Text>
      </Box>
    </Flex></>);
};

const ImageMode = (data: TaskModel) => {
  const { index, assignmentId } = useParams();
  const [step, setStep] = useState(0)
  return (
      <Center flexDir={'column'} pt={30} >
        {step === 0 ? <>
          <Heading size="md" mb={4} lineHeight={1.5}>
            ????????????????????????????????????????????????????????????????????????????????????
          </Heading>
          <Image mt={5} borderRadius={5} w={'100%'} src={data.imageUrl} />
          <Button
            mt={20}
            borderRadius={'3xl'}
            colorScheme={'yellow'}
            w={300}
            p={4}
            h="auto"
            onClick={() => setStep(1)}
          >
            ?????????
          </Button>
        </> : <>
          <Heading size="md" pt={30}>
            <Center>????????????????????????  <Text color={"yellow"} as="strong" fontWeight={"bold"}>{data.question}</Text></Center>
          </Heading>
          <Box mt={5}>
            <video width="100%" height={'auto'} controls autoPlay loop>
              <source src={data.videoUrl} type="video/mp4" />
            </video>
          </Box>
          <Button
            mt={20}
            borderRadius={'3xl'}
            colorScheme={'yellow'}
            w={300}
            p={4}
            h="auto"
            as={RemixLink}
            to={`/assignment/${assignmentId}/tasks/${index}/corrections`}
          >
            ????????????
          </Button>
        </>}
      </Center>
    );
};