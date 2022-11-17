import {
  Button,
  Container,
  Grid,
  Heading,
  useToast,
  VStack,
} from "@chakra-ui/react";

import { json, LoaderArgs } from "@remix-run/node";
import { Link as RemixLink, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { httpResponse } from "~/http";
import { getAllAssignment } from "~/models/assignment.server";

export const loader = async ({ request }: LoaderArgs) => {
  const assignmentList = await getAllAssignment();
  if (!assignmentList.length) {
    throw httpResponse.BadRequest;
  }
  return json({
    assignmentList,
  });
};

export default function Index() {
  const [name, setName] = useState("");
  const toast = useToast();
  let { assignmentList } = useLoaderData<typeof loader>();
  return (
    <Container h="100%">
      <Grid h="100%" templateRows="100px 1fr">
        <Heading mt={6} textAlign={"center"}>
          小朋友，请选择作业
        </Heading>
        <VStack
          borderRadius={"lg"}
          p={4}
          bg={"whiteAlpha.500"}
          overflow-y={"auto"}
          spacing={"8"}
        >
          {assignmentList.map((assignment) => (
            <Button
              py={8}
              size={"lg"}
              w="full"
              colorScheme={"teal"}
              key={assignment.id}
              as={RemixLink}
              to={`/assignment/${assignment.id}/start`}
            >
              {assignment.name}
            </Button>
          ))}
        </VStack>
      </Grid>
    </Container>
  );
}
