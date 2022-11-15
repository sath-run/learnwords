import {
  Button,
  Flex,
  Input, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
  ModalOverlay,
  Select,
  Spacer,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr, useDisclosure, useToast
} from '@chakra-ui/react';
import { useFetcher, useMatches } from '@remix-run/react';
import { Task } from '@prisma/client';
import { FormCancelButton, FormInput, FormModal, FormSubmitButton } from '~/ui';
import { Action } from '~/routes/admin';
import React, { useEffect, useRef, useState } from 'react';
import { withZod } from '@remix-validated-form/with-zod';
import z from 'zod';
import invariant from 'tiny-invariant';

const Task: React.FC = () => {
  const matches = useMatches();
  const assignmentList = matches[1].data.assignment as Array<Assignment>;
  invariant(assignmentList);
  const taskNewModal = useDisclosure();
  const fetcher = useFetcher();
  const [action, setAction] = useState(Action.NEW_ASSIGNMENT);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const currentData = useRef<Assignment>();
  const toast = useToast();
  const onAdd = () => {
    setAction(Action.NEW_TASK);
    taskNewModal.onOpen();
  };
  const isLoading = fetcher.state !== 'idle';
  const onDelete = () => {
    fetcher.submit(
      {
        id: currentData.current!.id,
        _action: Action.DELETE_ASSIGNMENT,
      },
      {
        method: 'patch',
        replace: true,
      }
    );
  };
  useEffect(() => {
    taskNewModal.onOpen();
    if (fetcher.type === "done") {
      setDeleteDialogVisible(false);
    }
  }, [fetcher.type]);
  return (<>
    <Flex>
      <Select maxW="48">
        {assignmentList.map(assignment => <option key={assignment.id} value={assignment.id}>{assignment.name}</option>)}
      </Select>
      <Spacer />
      <Button colorScheme={'blue'} onClick={onAdd}>新建任务</Button>
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
            <Th fontSize={16}>更多操作</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>1</Td>
            <Td>
              <Input />
            </Td>
            <Td>
              <Input />
            </Td>
            <Td>
              <Input />
            </Td>
            <Td>
              <Input />
            </Td>
            <Td>
              <Button>选择文件</Button>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
    <NewTaskModal {...taskNewModal} defaultValue={currentData.current} action={action}/>
  </>);
};


export const newTaskValidator = withZod(
  z.object({
    name: z.string().min(1, '请填写任务名称'),
  })
);

const NewTaskModal = ({
  isOpen,
  onClose,
  action,
  defaultValue = {} as Task
}: {
  isOpen: boolean;
  onClose: (data?: any) => void;
  action: string;
  defaultValue: Task | undefined;
}) => {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      validator={newTaskValidator}
      replace
      method="post"
      size="lg"
      action={"/admin"}
    >
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>{action === Action.NEW_TASK ? '新增任务' : '修改任务'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormInput type={"hidden"} name={"id"} value={defaultValue.id}/>
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
            label="初始词汇"
            placeholder="请填写初始词汇"
            autoComplete="off"
            defaultValue={defaultValue.initial}
          />
          <FormInput
            mb={5}
            name="alternative"
            label="更多词汇"
            placeholder="请填写更多词汇"
            autoComplete="off"
            defaultValue={defaultValue.alternative}
          />
          <FormInput
            mb={5}
            name="name"
            label="视频文件	"
            placeholder="请上传视频文件"
            autoComplete="off"
            defaultValue={defaultValue.videoUrl}
          />
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

export default Task;