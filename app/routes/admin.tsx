import {
  Box,
  Button,
  Container,
  DarkMode,
  Divider,
  Flex,
  Heading,
  Input,
  Select,
  Spacer,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { json } from "@remix-run/node";

export const loader = async () => {
  //   const videos = await listVideos();
  //   console.log(videos);
  return json({});
};

export default function Admin() {
  return (
    <DarkMode>
      <Box bg={"gray.900"} flexDir="column" px={0} h="full" pt="4">
        <Container maxW={"8xl"}>
          <Heading>管理控制台</Heading>
          <Divider my={4} />
          <Flex>
            <Select maxW="48">
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </Select>
            <Spacer />
            <Button colorScheme={"blue"}>新建作业</Button>
          </Flex>

          <TableContainer mt={4}>
            <Table variant="simple">
              <TableCaption>Imperial to metric conversion factors</TableCaption>
              <Thead>
                <Tr>
                  <Th>序号</Th>
                  <Th>问题</Th>
                  <Th>初始答案</Th>
                  <Th>初始词汇</Th>
                  <Th>更多词汇</Th>
                  <Th>视频文件</Th>
                  <Th isNumeric>更多操作</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td py={0}>1</Td>
                  <Td p={0}>
                    <Input />
                  </Td>
                  <Td p={0}>
                    <Input />
                  </Td>
                  <Td p={0}>
                    <Input />
                  </Td>
                  <Td p={0}>
                    <Input />
                  </Td>
                  <Td py={0}>
                    <Button>选择文件</Button>
                  </Td>
                </Tr>
                <Tr>
                  <Td>feet</Td>
                  <Td>centimetres (cm)</Td>
                  <Td isNumeric>30.48</Td>
                </Tr>
                <Tr>
                  <Td>yards</Td>
                  <Td>metres (m)</Td>
                  <Td isNumeric>0.91444</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
    </DarkMode>
  );
}
