import { Container } from "@chakra-ui/react";

import { ActionArgs, json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { httpResponse } from "~/http";
import { getAssignmentWithTasks } from "~/models/task.server";

export const loader = async ({ params }: ActionArgs) => {
  let assignmentId = Number(params.assignmentId);
  if (!assignmentId) {
    throw httpResponse.BadRequest;
  }
  const assignment = await getAssignmentWithTasks(assignmentId!);

  if (!assignment) {
    throw httpResponse.NotFound;
  }

  return json(assignment);
};

export default function Index() {
  return (
    <Container h="100%">
      <Outlet />
    </Container>
  );
}
