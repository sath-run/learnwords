import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Flex,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure, useToast
} from '@chakra-ui/react';
import { useFetcher, useMatches } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { Assignment } from '@prisma/client';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import dayjs from 'dayjs';
import { FormCancelButton, FormInput, FormModal, FormSubmitButton } from '~/ui';
import { withZod } from '@remix-validated-form/with-zod';
import z from 'zod';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import { Action } from '~/routes/admin';
import { FocusableElement } from '@chakra-ui/utils';

const Assignment = () => {
  const matches = useMatches();
  const assignmentList = matches[1].data.assignment as Array<Assignment & {url: string}>;
  invariant(assignmentList);
  const assignmentNewModal = useDisclosure();
  const fetcher = useFetcher();
  const [action, setAction] = useState(Action.NEW_ASSIGNMENT);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const currentData = useRef<Assignment>();
  const toast = useToast();
  const onAdd = () => {
    setAction(Action.NEW_ASSIGNMENT);
    assignmentNewModal.onOpen();
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
  const onCopy = (text: string) => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.value = text;
    input.select();
    document.execCommand('copy');
    input.remove();
    toast({
      title: '复制成功',
      status: 'success',
      position: 'top',
      isClosable: true,
    });
  }
  useEffect(() => {
    if (fetcher.type === "done") {
      setDeleteDialogVisible(false);
    }
  }, [fetcher.type]);
  return (<>
    <Flex>
      <Spacer />
      <Button colorScheme={'blue'} onClick={onAdd}>新建作业</Button>
    </Flex>
    <TableContainer mt={4}>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th fontSize={16}>序号</Th>
            <Th fontSize={16}>作业名称</Th>
            <Th fontSize={16}>修改时间</Th>
            <Th fontSize={16}>作业链接</Th>
            <Th fontSize={16}>更多操作</Th>
          </Tr>
        </Thead>
        <Tbody>
          {assignmentList.map((assignment,index) => (<Tr key={assignment.id}>
            <Td align={'center'}>{index + 1}</Td>
            <Td>
              {assignment.name}
            </Td>
            <Td>
              {dayjs(assignment.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
            </Td>
            <Td>
              {assignment.url} <Button colorScheme='teal' variant='ghost' onClick={() => onCopy(assignment.url)}>复制</Button>
            </Td>
            <Td>
              <Button colorScheme={'green'} mr={5} onClick={() => {
                currentData.current = assignment;
                assignmentNewModal.onOpen();
                setAction(Action.UPDATE_ASSIGNMENT);
              }}><FiEdit /></Button>
              <Button colorScheme={'red'} onClick={() => {
                setDeleteDialogVisible(true);
                currentData.current = assignment;
              }}><FiTrash2 /></Button>
            </Td>
          </Tr>))}
        </Tbody>
      </Table>
    </TableContainer>
    <NewAssignmentModal {...assignmentNewModal} action={action} defaultValue={currentData.current}/>
    <DeleteDialog isLoading={isLoading} isOpen={deleteDialogVisible} onClose={() => setDeleteDialogVisible(false)} onDelete={onDelete} />
  </>);
};

const DeleteDialog: React.FC<{
  isOpen: boolean;
  onClose: () => any;
  onDelete: () => any;
  isLoading: boolean;
}> = ({ isOpen, onClose, onDelete, isLoading }) => {
  const cancelRef = useRef<FocusableElement>();
  return <AlertDialog
    isOpen={isOpen}
    onClose={onClose}
    leastDestructiveRef={cancelRef as RefObject<FocusableElement>}
  >
    <AlertDialogOverlay>
      <AlertDialogContent>
        <AlertDialogHeader fontSize="lg" fontWeight="bold">
          确认删除
        </AlertDialogHeader>
        <AlertDialogBody>
          确定删除吗？删除后不能恢复
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef as RefObject<HTMLButtonElement>} onClick={onClose}>
            取消
          </Button>
          <Button isLoading={isLoading} colorScheme="red" ml={3} onClick={onDelete}>
            删除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogOverlay>
  </AlertDialog>;
};

export const newAssignmentValidator = withZod(
  z.object({
    name: z.string().min(1, '请填写作业名称'),
  })
);

const NewAssignmentModal = ({
  isOpen,
  onClose,
  action,
  defaultValue = {} as Assignment
}: {
  isOpen: boolean;
  onClose: (data?: any) => void;
  action: string;
  defaultValue: Assignment | undefined;
}) => {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      validator={newAssignmentValidator}
      replace
      method="post"
      size="lg"
      action={"/admin"}
    >
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>{action === Action.NEW_ASSIGNMENT ? '新增作业' : '修改作业'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormInput type={"hidden"} name={"id"} value={defaultValue.id}/>
          <FormInput
            name="name"
            label="作业名称"
            placeholder="请填写作业名称"
            autoComplete="off"
            defaultValue={defaultValue.name}
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

export default Assignment;