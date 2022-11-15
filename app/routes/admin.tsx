import {
  Box,
  Container,
  DarkMode,
  Divider,
  Heading,
  TabList,
  TabPanel,
  TabPanels,
  Tab,
  Tabs, useToast,
} from '@chakra-ui/react';
import { ActionArgs, json, redirect } from '@remix-run/node';
import Task from '~/routes/...task';
import Assignment, { newAssignmentValidator } from '~/routes/...assignment';
import {
  addAssignment,
  deleteAssignment,
  getAllAssignment, updateAssignment
} from '~/models/assignment.server';
import { validationError } from 'remix-validated-form';
import { httpResponse } from '~/http';
import { useEffect } from 'react';
import { useTransition } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import z from 'zod';

export const loader = async ({ request }: ActionArgs) => {
  const origin = new URL(request.url).origin;
  const assignmentList = await getAllAssignment();
  return json({
    assignment: assignmentList.map(assignment => ({
      ...assignment,
      url: `${origin}/assignment/${assignment.id}`
    }))
  });
};

export enum Action {
  NEW_ASSIGNMENT = 'NEW_ASSIGNMENT',
  UPDATE_ASSIGNMENT = 'UPDATE_ASSIGNMENT',
  DELETE_ASSIGNMENT = 'DELETE_ASSIGNMENT',
  NEW_TASK = 'NEW_TASK',
  UPDATE_TASK = 'UPDATE_TASK',
  DELETE_TAsk = 'DELETE_TAsk',
}

export const action = async ({ request }: ActionArgs) => {
  let formData = await request.formData();
  console.info(formData.get('_action'));
  switch (formData.get('_action')) {
    case Action.NEW_ASSIGNMENT:
      return await newAssignmentAction(formData);
    case Action.UPDATE_ASSIGNMENT:
      return await updateAssignmentAction(formData);
    case Action.DELETE_ASSIGNMENT:
      return await deleteAssignmentAction(formData);
    default:
      console.info('_action:', formData.get('_action'));
      return httpResponse.NotFound;
  }
};

const deleteAssignmentAction = async (formData: FormData) => {
  const result = await withZod(
    z.object({
      id: z.string().min(1, 'ID是必须的'),
    })
  ).validate(formData);
  if (result.error) {
    return validationError(result.error);
  }
  const { id } = result.data;
  await deleteAssignment(id);
  return redirect(`/admin`);
};

const newAssignmentAction = async (formData: FormData) => {
  const result = await newAssignmentValidator.validate(formData);
  if (result.error) {
    return validationError(result.error);
  }
  const { name } = result.data;
  await addAssignment(name);
  return redirect(`/admin`);
};

const updateAssignmentAction = async (formData: FormData) => {
  const result = await withZod(
    z.object({
      id: z.string(),
      name: z.string().min(1, '请填写作业名称')
    })
  ).validate(formData);
  if (result.error) {
    return validationError(result.error);
  }
  const { name, id } = result.data;
  await updateAssignment(id, name);
  return redirect(`/admin`);
};

export default function Admin() {
  const toast = useToast();
  const transition = useTransition();
  useEffect(() => {
    if (transition.state === 'loading') {
      toast({
        title: '操作成功',
        status: 'success',
        position: 'top',
        isClosable: true,
      });
    }
  }, [transition.state]);
  return (
    <DarkMode>
      <Box bg={'gray.900'} flexDir="column" px={0} h="full" pt="4">
        <Container maxW={'8xl'}>
          <Heading>管理控制台</Heading>
          <Divider my={4} />

          <Tabs mt={10}>
            <TabList>
              <Tab>作业管理</Tab>
              <Tab>任务管理</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Assignment />
              </TabPanel>
              <TabPanel>
                <Task />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    </DarkMode>
  );
}
