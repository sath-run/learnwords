import {
  Container,
} from "@chakra-ui/react";

import { Outlet } from '@remix-run/react';
import { ActionArgs, json } from '@remix-run/node';
import { getAllTasks } from '~/models/task.server';


export const loader = async ({ params }: ActionArgs) => {
  const taskList = await getAllTasks(params.assignmentId!);
  return json({
    taskList
  });
};

export default function Index() {
  return (
    <Container h="100%">
      <Outlet />
    </Container>
  );
}
