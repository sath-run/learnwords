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
import { Form, Link, useLoaderData, useParams } from "@remix-run/react";
import { ReactNode, useState } from "react";
import { loader, action } from "./tasks.$taskId";
import { ImArrowRight, ImArrowLeft } from "react-icons/im";
import invariant from "tiny-invariant";
import {
  DragDropContext,
  Draggable,
  DragStart,
  Droppable,
  DropResult,
  ResponderProvided,
} from "react-beautiful-dnd";

export { loader, action };

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
    <Box ref={innerRef} {...rest}>
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <Form method="post">
        <ModalOverlay />
        <ModalContent bg="gray.800" color={"white"}>
          <ModalHeader fontFamily={"cursive"}>
            小朋友，请确认你的答案
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
              取消
            </Button>
            <Button
              type="submit"
              name="_action"
              value="rephrase"
              size="lg"
              width={32}
              colorScheme="blue"
            >
              确认
            </Button>
          </ModalFooter>
        </ModalContent>
      </Form>
    </Modal>
  );
};

export default function () {
  let data = useLoaderData<typeof loader>();
  let { taskId } = useParams();
  let [words, setWords] = useState(data.initial);
  let [alts, setAlts] = useState(data.alternative);
  let [isDraggingInitial, setIsDraggingInitial] = useState(false);
  let modal = useDisclosure();
  invariant(taskId);

  const onDragStart = (initial: DragStart, provided: ResponderProvided) => {
    if (initial.source.droppableId === "answer") {
      let word = words[initial.source.index];
      setIsDraggingInitial(isInitial(word));
    }
  };

  const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
    setIsDraggingInitial(false);

    const { draggableId, source, destination } = result;
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
      h="100%"
    >
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
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
            to={`/tasks/${taskId}`}
            colorScheme={"blackAlpha"}
            size="lg"
          >
            <Icon as={ImArrowLeft} mr={2} />
            取消
          </Button>
          <Button colorScheme={"blue"} size="lg" onClick={modal.onOpen}>
            提交
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
