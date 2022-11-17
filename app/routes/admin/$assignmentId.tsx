import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  Input,
  Link,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spacer,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FocusableElement } from "@chakra-ui/utils";
import { Assignment } from "@prisma/client";
import { ActionArgs, json, redirect } from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useMatches,
  useNavigate,
  useParams,
  useTransition,
} from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import React, {
  ChangeEvent,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { validationError } from "remix-validated-form";
import z from "zod";
import { httpResponse } from "~/http";
import {
  addTask,
  deleteTask,
  getAssignmentWithTasks,
  updateTask,
} from "~/models/task.server";
import { client } from "~/services/aliyun.server";
import { FormCancelButton, FormInput, FormModal, FormSubmitButton } from "~/ui";

export const loader = async ({ params }: ActionArgs) => {
  let assignmentId = Number(params.assignmentId);
  if (!assignmentId) {
    throw httpResponse.BadRequest;
  }
  let assignment = await getAssignmentWithTasks(assignmentId);
  if (!assignment) {
    throw httpResponse.NotFound;
  }
  return json(assignment);
};

export enum Action {
  NEW_TASK = "NEW_TASK",
  UPDATE_TASK = "UPDATE_TASK",
  DELETE_TASK = "DELETE_TASK",
  GET_UPLOAD_FILE = "GET_UPLOAD_FILE",
}

export const action = async ({ request, params }: ActionArgs) => {
  let formData = await request.formData();
  let assignmentId = Number(params.assignmentId);

  if (!assignmentId) {
    return httpResponse.BadRequest;
  }

  switch (formData.get("_action")) {
    case Action.GET_UPLOAD_FILE:
      return await getUploadFile(formData);
    case Action.NEW_TASK:
      return await newTaskAction(assignmentId, formData);
    case Action.UPDATE_TASK:
      return await updateTaskAction(assignmentId, formData);
    case Action.DELETE_TASK:
      return await deleteTaskAction(assignmentId, formData);
    default:
      return httpResponse.NotFound;
  }
};

const deleteTaskAction = async (assignmentId: number, formData: FormData) => {
  let taskId = Number(formData.get("id"));
  if (!taskId) {
    return httpResponse.BadRequest;
  }
  await deleteTask(taskId);
  return redirect(`/admin/${assignmentId}`);
};

const updateTaskAction = async (assignmentId: number, formData: FormData) => {
  const result = await newTaskValidator.validate(formData);
  if (result.error) {
    return validationError(result.error);
  }
  const { question, example, initial, alternative, videoUrl, id } = result.data;
  await updateTask(id, {
    question,
    example,
    videoUrl,
    initial: initial.split(/[^\u4e00-\u9fa5]+/),
    alternative: alternative.split(/[^\u4e00-\u9fa5]+/),
  });
  return redirect(`/admin/${assignmentId}`);
};

const newTaskAction = async (assignmentId: number, formData: FormData) => {
  const result = await newTaskValidator.validate(formData);
  if (result.error) {
    return validationError(result.error);
  }
  const { question, example, initial, alternative, videoUrl } = result.data;
  await addTask({
    assignmentId,
    question,
    example,
    videoUrl,
    initial: initial.split(/[^\u4e00-\u9fa5]+/),
    alternative: alternative.split(/[^\u4e00-\u9fa5]+/),
  });
  return redirect(`/admin/${assignmentId}`);
};

const getUploadFile = async (formData: FormData) => {
  const result = client.signatureUrl(`${formData.get("fileName")}`, {
    method: "PUT",
    "Content-Type": "multipart/form-data",
  });
  return json({
    success: true,
    uploadUrl: result,
    url: client.generateObjectUrl(`${formData.get("fileName")}`),
  });
};

type TaskModel = {
  id: number;
  question: string;
  example: string;
  initial: string;
  alternative: string;
  videoUrl: string;
};

const Assignment: React.FC = () => {
  const { tasks } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const assignmentList = matches[1].data.assignments as Array<Assignment>;
  const taskNewModal = useDisclosure();
  const fetcher = useFetcher();
  const [action, setAction] = useState(Action.NEW_TASK);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const assignmentId = useParams().assignmentId || "";
  const currentData = useRef<TaskModel>();
  const toast = useToast();
  const navigate = useNavigate();
  const onAdd = () => {
    currentData.current = {} as unknown as TaskModel;
    setAction(Action.NEW_TASK);
    taskNewModal.onOpen();
  };
  const isLoading = fetcher.state !== "idle";
  const onDelete = () => {
    fetcher.submit(
      {
        id: currentData.current!.id.toString(),
        _action: Action.DELETE_TASK,
      },
      {
        method: "patch",
        replace: true,
      }
    );
  };
  const transition = useTransition();
  useEffect(() => {
    if (
      transition.state === "loading" &&
      transition.type === "fetchActionRedirect"
    ) {
      setDeleteDialogVisible(false);
      toast({
        title: "操作成功",
        status: "success",
        position: "top",
        isClosable: true,
      });
    }
  }, [transition.state, transition.type]);
  return (
    <>
      <Flex>
        <Select
          maxW="48"
          onChange={(e) => {
            navigate(`/admin/${e.target.value}`);
          }}
          defaultValue={assignmentId}
        >
          {assignmentList.map((assignment) => (
            <option key={assignment.id} value={assignment.id}>
              {assignment.name}
            </option>
          ))}
        </Select>
        <Spacer />
        <Button colorScheme={"blue"} onClick={onAdd}>
          新建任务
        </Button>
      </Flex>
      <TableContainer mt={4}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th fontSize={16}>序号</Th>
              <Th fontSize={16}>问题</Th>
              <Th fontSize={16}>初始答案</Th>
              <Th fontSize={16}>初始词汇</Th>
              <Th fontSize={16}>更多词汇</Th>
              <Th fontSize={16}>视频文件</Th>
              <Th fontSize={16} isNumeric>
                更多操作
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {tasks.map((task, index) => (
              <Tr key={task.id}>
                <Td>{index + 1}</Td>
                <Td>{task.question}</Td>
                <Td>{task.example}</Td>
                <Td>{task.initial.join("，")}</Td>
                <Td>{task.alternative.join("，")}</Td>
                <Td>
                  <Link color={"blue.200"} href={task.videoUrl} isExternal>
                    点击查看
                  </Link>
                </Td>
                <Td isNumeric>
                  <Tooltip label="编辑">
                    <Button
                      size="sm"
                      colorScheme={"green"}
                      mr={5}
                      onClick={() => {
                        currentData.current = {
                          ...task,
                          initial: task.initial.join("，"),
                          alternative: task.alternative.join("，"),
                        };
                        taskNewModal.onOpen();
                        setAction(Action.UPDATE_TASK);
                      }}
                    >
                      <FiEdit />
                    </Button>
                  </Tooltip>
                  <Tooltip label="删除任务">
                    <Button
                      size="sm"
                      colorScheme={"red"}
                      onClick={() => {
                        setDeleteDialogVisible(true);
                        currentData.current = {
                          ...task,
                          initial: task.initial.join("，"),
                          alternative: task.alternative.join("，"),
                        };
                      }}
                    >
                      <FiTrash2 />
                    </Button>
                  </Tooltip>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <NewTaskModal
        {...taskNewModal}
        defaultValue={currentData.current}
        assignmentId={assignmentId}
        action={action}
      />
      <DeleteDialog
        isLoading={isLoading}
        isOpen={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        onDelete={onDelete}
      />
    </>
  );
};

const DeleteDialog: React.FC<{
  isOpen: boolean;
  onClose: () => any;
  onDelete: () => any;
  isLoading: boolean;
}> = ({ isOpen, onClose, onDelete, isLoading }) => {
  const cancelRef = useRef<FocusableElement>();
  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef as RefObject<FocusableElement>}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            确认删除
          </AlertDialogHeader>
          <AlertDialogBody>确定删除吗？删除后不能恢复</AlertDialogBody>
          <AlertDialogFooter>
            <Button
              ref={cancelRef as RefObject<HTMLButtonElement>}
              onClick={onClose}
            >
              取消
            </Button>
            <Button
              isLoading={isLoading}
              colorScheme="red"
              ml={3}
              onClick={onDelete}
            >
              删除
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export const newTaskValidator = withZod(
  z.object({
    question: z.string().min(1, "请填写问题"),
    example: z.string().min(1, "请填写初始答案"),
    initial: z.string().min(1, "请填写初始词汇"),
    alternative: z.string().min(1, "请填写更多词汇"),
    videoUrl: z.string().min(1, "请上传视频文件"),
    id: z.string().transform((s) => Number(s)),
  })
);

const NewTaskModal = ({
  isOpen,
  onClose,
  action,
  defaultValue = {} as unknown as TaskModel,
  assignmentId,
}: {
  isOpen: boolean;
  onClose: (data?: any) => void;
  action: string;
  defaultValue: TaskModel | undefined;
  assignmentId: string;
}) => {
  const fetcher = useFetcher();
  const uploadFile = useRef<File>();
  const [videoUrl, setVideoUrl] = useState(defaultValue.videoUrl || "");
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    setVideoUrl(defaultValue.videoUrl || "");
  }, [defaultValue.videoUrl]);
  const onUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const targetEvent = event.target as HTMLInputElement;
    if (targetEvent.files && targetEvent.files.length) {
      uploadFile.current = targetEvent.files[0];
      setUploading(true);
      fetcher.submit(
        {
          _action: Action.GET_UPLOAD_FILE,
          fileName: `${Date.now()}.${targetEvent.files[0].name
            .split(".")
            .pop()}`,
        },
        { method: "post" }
      );
    }
  };
  useEffect(() => {
    if (fetcher.state === "loading") {
      const action = fetcher.submission?.formData.get("_action");
      switch (action) {
        case Action.GET_UPLOAD_FILE:
          if (fetcher.data.success) {
            fetch(fetcher.data.uploadUrl, {
              method: "PUT",
              body: uploadFile.current,
              headers: { "Content-Type": "multipart/form-data" },
            }).then((result) => {
              setUploading(false);
              if (result.status === 200) {
                setVideoUrl(fetcher.data.url);
              }
            });
          }
          break;
      }
    }
  }, [fetcher.state]);
  return (
    <FormModal
      id={"newTaskForm"}
      isOpen={isOpen}
      onClose={({ success }) => {
        if (success) {
          setVideoUrl("");
        }
        onClose();
      }}
      validator={newTaskValidator}
      replace
      method="post"
      size="lg"
      resetAfterSubmit={true}
      action={`/admin/${assignmentId}`}
    >
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>
          {action === Action.NEW_TASK ? "新增任务" : "修改任务"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormInput type={"hidden"} name={"id"} value={defaultValue.id} />
          <FormInput
            mb={5}
            name="question"
            label="问题"
            placeholder="请填写问题"
            autoComplete="off"
            defaultValue={defaultValue.question}
          />
          <FormInput
            mb={5}
            name="example"
            label="初始答案"
            placeholder="请填写初始答案"
            autoComplete="off"
            defaultValue={defaultValue.example}
          />
          <FormInput
            mb={5}
            name="initial"
            label={
              <Flex align={"center"}>
                初始词汇
                <Text fontSize={"sm"} color={"gray"}>
                  (标点符号分割)
                </Text>
              </Flex>
            }
            placeholder="请填写初始词汇"
            autoComplete="off"
            defaultValue={defaultValue.initial}
          />
          <FormInput
            mb={5}
            name="alternative"
            label={
              <Flex align={"center"}>
                更多词汇
                <Text fontSize={"sm"} color={"gray"}>
                  (标点符号分割)
                </Text>
              </Flex>
            }
            placeholder="请填写更多词汇"
            autoComplete="off"
            defaultValue={defaultValue.alternative}
          />
          <FormInput
            mb={5}
            type={"hidden"}
            name="videoUrl"
            label="视频文件	"
            placeholder="请上传视频文件"
            autoComplete="off"
            value={videoUrl}
          >
            <Box>
              {videoUrl && <video width={200} src={videoUrl} controls />}
              <Button
                isLoading={uploading}
                mt={2}
                colorScheme={"blue"}
                position={"relative"}
              >
                <Input
                  position={"absolute"}
                  left={0}
                  right={0}
                  top={0}
                  bottom={0}
                  type={"file"}
                  opacity={0}
                  onChange={onUploadFile}
                  accept={".mp4"}
                />
                选择文件
              </Button>
            </Box>
          </FormInput>
        </ModalBody>

        <ModalFooter>
          <FormCancelButton onClick={onClose} mr={3}>
            取消
          </FormCancelButton>
          <FormSubmitButton
            type="submit"
            name="_action"
            value={action}
            colorScheme="blue"
          >
            确定
          </FormSubmitButton>
        </ModalFooter>
      </ModalContent>
    </FormModal>
  );
};

export default Assignment;
