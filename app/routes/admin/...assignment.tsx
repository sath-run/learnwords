import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Flex,
  Link,
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
  Tooltip,
  Tr,
  Textarea,
  useDisclosure,
  useToast, Icon, Checkbox, RadioGroup, Stack, Radio, FormLabel
} from '@chakra-ui/react';
import { FocusableElement } from '@chakra-ui/utils';
import { Assignment as PrismaAssignment } from '@prisma/client';
import { withZod } from '@remix-validated-form/with-zod';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import { FiCopy, FiEdit, FiShare, FiTrash2 } from 'react-icons/fi';
import z from 'zod';
import { Action, loader } from '~/routes/admin';
import { FormCancelButton, FormInput, FormModal, FormSubmitButton } from '~/ui';
import { useFetcher, useLoaderData } from '@remix-run/react';

type Assignment = Omit<PrismaAssignment, 'createdAt' | 'updatedAt'>;

const Assignment = () => {
  const { assignments, origin: initialOrigin } = useLoaderData<typeof loader>();
  const assignmentNewModal = useDisclosure();
  const fetcher = useFetcher();
  const [action, setAction] = useState(Action.NEW_ASSIGNMENT);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const currentData = useRef<Assignment>();
  const toast = useToast();

  let [origin, setOrigin] = useState(initialOrigin);

  useEffect(() => {
    let urlobj = new URL(window.location.href);
    setOrigin(urlobj.origin);
  }, []);

  useEffect(() => {
    if (fetcher.type === 'done') {
      setDeleteDialogVisible(false);
    }
  }, [fetcher.type]);
  const onAdd = () => {
    currentData.current = {} as unknown as Assignment;
    setAction(Action.NEW_ASSIGNMENT);
    assignmentNewModal.onOpen();
  };
  const isLoading = fetcher.state !== 'idle';
  const onDelete = () => {
    fetcher.submit(
      {
        id: currentData.current!.id.toString(),
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
      title: '????????????',
      status: 'success',
      position: 'top',
      isClosable: true,
    });
  };
  const onExport = (id: number) => {
    window.open(`/admin/${id}/download`, '_black');
  };
  return (
    <>
      <Flex>
        <Spacer />
        <Button colorScheme={'blue'} onClick={onAdd}>
          ????????????
        </Button>
      </Flex>
      <TableContainer mt={4}>
        <Table variant="simple" width={'100%'}>
          <Thead>
            <Tr>
              <Th fontSize={16}>??????</Th>
              <Th fontSize={16}>????????????</Th>
              <Th fontSize={16}>???????????????</Th>
              <Th fontSize={16}>????????????</Th>
              <Th fontSize={16} isNumeric>
                ????????????
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {assignments.map((assignment, index) => (
              <Tr key={assignment.id}>
                <Td align={'center'}>{index + 1}</Td>
                <Td>{assignment.name}</Td>
                <Td>
                  <Tooltip label={assignment.prologue}>
                    <Button colorScheme="teal" variant="link">??????</Button>
                  </Tooltip>
                </Td>
                <Td>
                  <Link
                    isExternal
                    href={`${origin}/assignment/${assignment.id}`}
                  >
                    {`${origin}/assignment/${assignment.id}`}
                  </Link>
                  <Button
                    colorScheme="teal"
                    variant="ghost"
                    onClick={() =>
                      onCopy(`${origin}/assignment/${assignment.id}`)
                    }
                    size="sm"
                  >
                    <Icon as={FiCopy} />
                  </Button>
                </Td>
                <Td isNumeric>
                  <Tooltip label="????????????">
                    <Button
                      size="sm"
                      mr={5}
                      colorScheme={'green'}
                      onClick={() => onExport(assignment.id)}
                    >
                      <FiShare />
                    </Button>
                  </Tooltip>
                  <Tooltip label="??????">
                    <Button
                      colorScheme={'green'}
                      mr={5}
                      size="sm"
                      onClick={() => {
                        currentData.current = assignment;
                        assignmentNewModal.onOpen();
                        setAction(Action.UPDATE_ASSIGNMENT);
                      }}
                    >
                      <FiEdit />
                    </Button>
                  </Tooltip>
                  <Tooltip label="????????????">
                    <Button
                      size="sm"
                      colorScheme={'red'}
                      onClick={() => {
                        setDeleteDialogVisible(true);
                        currentData.current = assignment;
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
      <NewAssignmentModal
        {...assignmentNewModal}
        action={action}
        defaultValue={currentData.current}
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
            ????????????
          </AlertDialogHeader>
          <AlertDialogBody>???????????????????????????????????????</AlertDialogBody>
          <AlertDialogFooter>
            <Button
              ref={cancelRef as RefObject<HTMLButtonElement>}
              onClick={onClose}
            >
              ??????
            </Button>
            <Button
              isLoading={isLoading}
              colorScheme="red"
              ml={3}
              onClick={onDelete}
            >
              ??????
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export const newAssignmentValidator = withZod(
  z.object({
    name: z.string().min(1, '?????????????????????'),
    isShowTip: z.string(),
    prologue: z.string().min(1, '????????????????????????'),
  })
);

const NewAssignmentModal = ({
  isOpen,
  onClose,
  action,
  defaultValue = {} as Assignment,
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
      resetAfterSubmit={true}
      action={'/admin'}
    >
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>
          {action === Action.NEW_ASSIGNMENT ? '????????????' : '????????????'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormInput type={'hidden'} name={'id'} value={defaultValue.id} />
          <FormInput
            name="name"
            mb={5}
            label="????????????"
            placeholder="?????????????????????"
            autoComplete="off"
            defaultValue={defaultValue.name}
          />
          <FormLabel>??????????????????</FormLabel>
          <RadioGroup mb={5} name={'isShowTip'} defaultValue={defaultValue.isShowTip ? 'on' : 'off'}>
            <Stack direction='row'>
              <Radio value='on'>??????</Radio>
              <Radio value='off'>??????</Radio>
            </Stack>
          </RadioGroup>
          <FormInput
            name="prologue"
            label="???????????????"
            as={Textarea}
            rows={8}
            placeholder="????????????????????????"
            autoComplete="off"
            defaultValue={defaultValue.prologue}
          />
        </ModalBody>

        <ModalFooter>
          <FormCancelButton onClick={onClose} mr={3}>
            ??????
          </FormCancelButton>
          <FormSubmitButton
            type="submit"
            name="_action"
            value={action}
            colorScheme="blue"
          >
            ??????
          </FormSubmitButton>
        </ModalFooter>
      </ModalContent>
    </FormModal>
  );
};

export default Assignment;
