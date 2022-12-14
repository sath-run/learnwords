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
  useNavigate,
  useTransition,
} from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useEffect } from "react";
import { validationError } from "remix-validated-form";
import z from "zod";
import { httpResponse } from "~/http";
import { getAdminById, updatePassword } from "~/models/admin.server";
import {
  addAssignment,
  deleteAssignment,
  getAllAssignment,
  updateAssignment,
} from "~/models/assignment.server";
import { getAdminUserId, requireAdminUserId } from "~/session.server";
import Account, { passwordValidator } from "./admin/...account";
import AssignmentList, { newAssignmentValidator } from "./admin/...assignment";

export const loader = async ({ request }: ActionArgs) => {
  const userId = await requireAdminUserId(request);
  const origin = new URL(request.url).origin;
  const assignmentList = await getAllAssignment();
  return json({
    assignments: assignmentList.map((assignment) => ({
      ...assignment,
    })),
    origin: origin,
    user: await getAdminById(userId),
  });
};

export enum Action {
  NEW_ASSIGNMENT = "NEW_ASSIGNMENT",
  UPDATE_ASSIGNMENT = "UPDATE_ASSIGNMENT",
  DELETE_ASSIGNMENT = "DELETE_ASSIGNMENT",
  UPDATE_PASSWORD = "UPDATE_PASSWORD",
}

export const action = async ({ request }: ActionArgs) => {
  let formData = await request.formData();
  const userId = await getAdminUserId(request);
  switch (formData.get("_action")) {
    case Action.NEW_ASSIGNMENT:
      if (!userId) {
        return httpResponse.Forbidden;
      }
      return await newAssignmentAction(userId, formData);
    case Action.UPDATE_ASSIGNMENT:
      return await updateAssignmentAction(formData);
    case Action.DELETE_ASSIGNMENT:
      return await deleteAssignmentAction(formData);
    case Action.UPDATE_PASSWORD:
      return await updatePasswordAction(userId, formData);
    default:
      return httpResponse.NotFound;
  }
};

const updatePasswordAction = async (userId: number, formData: FormData) => {
  const result = await passwordValidator.validate(formData);
  if (result.error) {
    return validationError(result.error);
  }
  const updateResult = await updatePassword(
    userId,
    result.data.currentPassword,
    result.data.password
  );
  if (!updateResult) {
    return validationError(
      { fieldErrors: { currentPassword: "?????????????????????" } },
      result.submittedData,
      { status: 401 }
    );
  }
  return redirect(`/admin`);
};

const deleteAssignmentAction = async (formData: FormData) => {
  const result = await withZod(
    z.object({
      id: z
        .string()
        .min(1, "ID????????????")
        .transform((s) => Number(s)),
    })
  ).validate(formData);
  if (result.error) {
    throw validationError(result.error);
  }
  const { id } = result.data;
  if (!id) {
    throw httpResponse.BadRequest;
  }
  console.log(result.data, result.submittedData);
  await deleteAssignment(id);
  return redirect(`/admin`);
};

const newAssignmentAction = async (userId: number, formData: FormData) => {
  const result = await newAssignmentValidator.validate(formData);
  if (result.error) {
    return validationError(result.error);
  }
  const { name, prologue, isShowTip } = result.data;
  await addAssignment({name,prologue, isShowTip: isShowTip === 'on'});
  return redirect(`/admin`);
};

const updateAssignmentAction = async (formData: FormData) => {
  const result = await withZod(
    z.object({
      id: z.string().transform((s) => Number(s)),
      name: z.string().min(1, "?????????????????????"),
      isShowTip: z.string(),
      prologue: z.string().min(1, "????????????????????????"),
    })
  ).validate(formData);
  if (result.error) {
    return validationError(result.error);
  }
  const { name, id, prologue, isShowTip } = result.data;
  await updateAssignment(id, { name, prologue, isShowTip: isShowTip === 'on'});
  return redirect(`/admin`);
};

export default function Admin() {
  const transition = useTransition();
  const toast = useToast();
  // const location = useLocation();
  const navigate = useNavigate();
  const { assignments } = useLoaderData<typeof loader>();
  useEffect(() => {
    console.info(transition);
    if (
      transition.state === "loading" &&
      ["actionRedirect", "fetchActionRedirect"].includes(transition.type) &&
      transition.location.pathname === "/admin"
    ) {
      const action = transition.submission?.formData?.get("_action");
      if (action === Action.UPDATE_PASSWORD) {
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
      toast({
        title: "????????????",
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
          <Tabs my={10}>
            <TabList>
              <Tab>
                <Link to={"/admin"}>????????????</Link>
              </Tab>
              <Tab>
                <Link
                  to={`/admin/${assignments[0] ? assignments[0].id : "task"}`}
                >
                  ????????????
                </Link>
              </Tab>
              <Tab>????????????</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <AssignmentList />
              </TabPanel>
              <TabPanel>
                <Outlet />
              </TabPanel>
              <TabPanel>
                <Account />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    </DarkMode>
  );
}
