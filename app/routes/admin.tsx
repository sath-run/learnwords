import {
  Box,
  Container,
  DarkMode,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
} from "@chakra-ui/react";
import { ActionArgs, json, redirect } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useTransition,
} from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useEffect } from "react";
import { validationError } from "remix-validated-form";
import z from "zod";
import { httpResponse } from "~/http";
import {
  addAssignment,
  deleteAssignment,
  getAllAssignment,
  updateAssignment,
} from "~/models/assignment.server";
import AssignmentList, { newAssignmentValidator } from "./admin/...assignment";
import { getAdminUserId, requireAdminUserId } from '~/session.server';

export const loader = async ({ request }: ActionArgs) => {
  const userId = await requireAdminUserId(request);
  const origin = new URL(request.url).origin;
  const assignmentList = await getAllAssignment(Number(userId));
  return json({
    assignments: assignmentList.map((assignment) => ({
      ...assignment,
    })),
    origin: origin,
  });
};

export enum Action {
  NEW_ASSIGNMENT = "NEW_ASSIGNMENT",
  UPDATE_ASSIGNMENT = "UPDATE_ASSIGNMENT",
  DELETE_ASSIGNMENT = "DELETE_ASSIGNMENT",
}

export const action = async ({ request }: ActionArgs) => {
  let formData = await request.formData();
  switch (formData.get("_action")) {
    case Action.NEW_ASSIGNMENT:
      const userId = await getAdminUserId(request);
      if(!userId){
        return httpResponse.Forbidden;
      }
      return await newAssignmentAction(userId, formData);
    case Action.UPDATE_ASSIGNMENT:
      return await updateAssignmentAction(formData);
    case Action.DELETE_ASSIGNMENT:
      return await deleteAssignmentAction(formData);
    default:
      return httpResponse.NotFound;
  }
};

const deleteAssignmentAction = async (formData: FormData) => {
  const result = await withZod(
    z.object({
      id: z.number().min(1, "ID是必须的"),
    })
  ).validate(formData);
  if (result.error) {
    return validationError(result.error);
  }
  const { id } = result.data;
  await deleteAssignment(id);
  return redirect(`/admin`);
};

const newAssignmentAction = async (userId: string, formData: FormData) => {
  const result = await newAssignmentValidator.validate(formData);
  if (result.error) {
    return validationError(result.error);
  }
  const { name } = result.data;
  await addAssignment(Number(userId), name);
  return redirect(`/admin`);
};

const updateAssignmentAction = async (formData: FormData) => {
  const result = await withZod(
    z.object({
      id: z.string().transform((s) => Number(s)),
      name: z.string().min(1, "请填写作业名称"),
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
  const transition = useTransition();
  const toast = useToast();
  const location = useLocation();
  const { assignments } = useLoaderData<typeof loader>();
  useEffect(() => {
    if (
      transition.state === "loading" &&
      transition.type === "fetchActionRedirect" &&
      transition.location.pathname === "/admin"
    ) {
      toast({
        title: "操作成功",
        status: "success",
        position: "top",
        isClosable: true,
      });
    }
  }, [transition.state, transition.type]);
  return (
    <DarkMode>
      <Box
        bg={"gray.900"}
        flexDir="column"
        px={0}
        h="full"
        pt="4"
        overflowY={"auto"}
      >
        <Container maxW={"8xl"}>
          <Tabs my={10} index={location.pathname === "/admin" ? 0 : 1}>
            <TabList>
              <Tab>
                <Link to={"/admin"}>作业管理</Link>
              </Tab>
              <Tab>
                <Link
                  to={`/admin/${assignments[0] ? assignments[0].id : "task"}`}
                >
                  任务管理
                </Link>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <AssignmentList />
              </TabPanel>
              <TabPanel>
                <Outlet />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    </DarkMode>
  );
}
