import {
  Box,
  BoxProps,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { ActionArgs, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { ReactNode, useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  DragStart,
  Droppable,
  DropResult,
  ResponderProvided,
} from "react-beautiful-dnd";
import { ImArrowLeft, ImArrowRight } from "react-icons/im";
import invariant from "tiny-invariant";
import { httpResponse } from "~/http";
import { AddLog } from "~/models/log.server";
import { getAssignmentWithTasks } from "~/models/task.server";
import { requireUserName } from "~/session.server";
import { loader } from "./tasks.$index";

export { loader };

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
    taskId: taskList[taskIndex].id,
    assignmentId: assignmentId,
    answer: answer ?? "",
    question: taskList[taskIndex].question,
    example: taskList[taskIndex].example,
  });

  if (taskIndex === taskList.length - 1) {
    return redirect(`/assignment/${assignmentId}/finish`);
  } else {
    return redirect(`/assignment/${assignmentId}/tasks/${taskIndex + 1}`);
  }
};

const Carriage = ({
  children,
  bg,
  innerRef,
  ...rest
}: {
  innerRef?: React.LegacyRef<HTMLDivElement>;
  children: ReactNode;
} & BoxProps) => {
  let radius = 10;
  return (
    <Box userSelect={"none"} ref={innerRef} {...rest}>
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

const ConfirmModal = ({
  isOpen,
  onClose,
  words,
}: {
  isOpen: boolean;
  onClose: () => void;
  words: string[];
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered={true} size={'sm'}>
      <Form method="post">
        <ModalOverlay />
        <ModalContent bg="gray.800" color={"white"} w={'90vw'}>
          <ModalHeader fontFamily={"cursive"}>
            ?????????????????????????????????
          </ModalHeader>
          <Divider />
          <ModalCloseButton />
          <ModalBody py={16}>
            <Heading textAlign={"center"} size={"lg"} color="yellow">
              {words.join("")}
            </Heading>
            <input type="hidden" name="answer" value={words.join("")} />
          </ModalBody>
          <Divider />
          <ModalFooter display={"flex"} justifyContent="space-evenly">
            <Button
              colorScheme={"whiteAlpha"}
              width={32}
              mr={3}
              onClick={onClose}
              size="lg"
            >
              ??????
            </Button>
            <Button
              type="submit"
              name="_action"
              value="rephrase"
              size="lg"
              width={32}
              colorScheme="blue"
            >
              ??????
            </Button>
          </ModalFooter>
        </ModalContent>
      </Form>
    </Modal>
  );
};

export default function () {
  const { index, assignmentId } = useParams();
  invariant(index);
  const assignment = useLoaderData<typeof loader>();
  let data = assignment.tasks[Number(index)];

  const navigate = useNavigate();

  useEffect(() => {
    if (!data) {
      navigate(`/assignment/${assignmentId}/finish`, { replace: true });
    }
  }, []);

  if (!data) {
    return null;
  }

  let [words, setWords] = useState<string[]>(data.initial);
  let [alts, setAlts] = useState<string[]>(data.alternative);
  let [isDraggingInitial, setIsDraggingInitial] = useState(false);
  let modal = useDisclosure();
  invariant(index);

  const onDragStart = (initial: DragStart, provided: ResponderProvided) => {
    if (initial.source.droppableId === "answer") {
      let word = words[initial.source.index];
      setIsDraggingInitial(isInitial(word));
    }
  };

  const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
    setIsDraggingInitial(false);

    const { source, destination } = result;
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    let newWords = [...words];
    let newAlts = [...alts];
    let word: string = "";
    if (source.droppableId === "answer") {
      newWords.splice(source.index, 1);
      word = words[source.index];
    } else {
      newAlts.splice(source.index, 1);
      word = alts[source.index];
    }

    if (isInitial(word) && destination.droppableId !== "answer") {
      return;
    }

    if (destination.droppableId === "answer") {
      newWords.splice(destination.index, 0, word);
    } else {
      newAlts.splice(destination.index, 0, word);
    }

    setWords(newWords);
    setAlts(newAlts);
  };

  const isInitial = (text: string) => data.initial.indexOf(text) >= 0;

  return (
    <Container
      display={"flex"}
      flexDir="column"
      justifyContent={"space-between"}
      textAlign={"center"}
      alignItems="center"
      px={2}
      py={16}
      minH="100%"
    >
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Heading color="teal.50" px={2} size={"md"} lineHeight="8">
          {!data.imageUrl && <>?????????
          <Text color={"yellow"} as="strong" fontWeight={"bold"}>
            {data.example}
          </Text>
          ?????????
          <br /></>}
          ???????????????????????????????????????????????????
          <br />
          ???????????????"???"??????????????????
          <br />
          ????????????????????????????????????????????????"???"??????????????????????????????
        </Heading>
        <Droppable droppableId="answer" direction="horizontal">
          {(provided, snapshot) => (
            <Flex
              px={1}
              py={10}
              borderWidth={2}
              borderRadius="md"
              backgroundColor={
                snapshot.isDraggingOver ? "whiteAlpha.200" : undefined
              }
              w={"full"}
              // justifyContent="center"
              {...provided.droppableProps}
              ref={provided.innerRef}
              overflowX="auto"
            >
              {words.map((text, i) => (
                <Draggable key={text} draggableId={text} index={i}>
                  {(provided, snapshot) => (
                    <Carriage
                      bg={isInitial(text) ? "yellow.500" : "green.500"}
                      mx={0.5}
                      innerRef={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {text}
                    </Carriage>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Flex>
          )}
        </Droppable>

        <Droppable
          droppableId="alts"
          direction="horizontal"
          isDropDisabled={isDraggingInitial}
        >
          {(provided, snapshot) => (
            <Flex
              px={1}
              py={16}
              height={"188px"}
              borderWidth={2}
              borderRadius="50%"
              w={"full"}
              // justifyContent="space-evenly"
              justifyContent="center"
              backgroundColor={
                snapshot.isDraggingOver ? "whiteAlpha.200" : undefined
              }
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {alts.map((text, i) => (
                <Draggable key={text} draggableId={text} index={i}>
                  {(provided, snapshot) => (
                    <Carriage
                      bg={isInitial(text) ? "yellow.500" : "green.500"}
                      mx={0.5}
                      innerRef={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {text}
                    </Carriage>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Flex>
          )}
        </Droppable>
        <Flex justifyContent={"space-around"} w="full">
          <Button
            as={Link}
            to={`/assignment/${assignmentId}/tasks/${index}`}
            colorScheme={"blackAlpha"}
            size="lg"
          >
            <Icon as={ImArrowLeft} mr={2} />
            ??????
          </Button>
          <Button colorScheme={"yellow"} size="lg" onClick={modal.onOpen}>
            ??????
            <Icon as={ImArrowRight} ml={2} />
          </Button>
          <ConfirmModal
            isOpen={modal.isOpen}
            onClose={modal.onClose}
            words={words}
          />
        </Flex>
      </DragDropContext>
    </Container>
  );
}
