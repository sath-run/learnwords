import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Heading,
  Icon,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';

import { FiCheck, FiX } from 'react-icons/fi';
import { BsQuestion } from 'react-icons/bs';
import { Form } from '@remix-run/react';
import { ActionArgs } from '@remix-run/node';
import { useState } from 'react';
import { httpResponse } from '~/http';
import { createUserSession } from '~/session.server';

export const action = async ({ request, params }: ActionArgs) => {
  let formData = await request.formData();
  let name = formData.get('name') as string;
  if (!name) {
    return httpResponse.BadRequest;
  }
  return createUserSession({
    request,
    userName: name,
    remember: true,
    redirectTo: `/assignment/${params.assignmentId}/tasks/0`,
  });
};

export default function Index() {
  const [name, setName] = useState('');
  const toast = useToast();
  return (
    <Grid
      h="100%"
      as={Form}
      method="post"
      py={10}
      templateRows="80px 1fr 1fr 1fr 120px"
      onSubmit={(e) => {
        let nameValue = name.trim();
        if (!nameValue) {
          e.preventDefault();
          toast({
            title: '小朋友，请输入你的姓名',
            status: 'error',
            duration: 5000,
            position: 'top',
            isClosable: true,
          });
        }
      }}
    >
      <Heading fontFamily={'cursive'} textAlign={'center'}>
        小朋友你好
        <br />
        我们来玩一个小游戏吧！
      </Heading>
      <Heading px={4} textAlign="center" as={Center} size="lg">
        你会看到几个视频
        <br />
        请根据视频判断句子是否正确
      </Heading>
      <Flex
        fontSize={'lg'}
        textAlign={'center'}
        justifyContent={'space-between'}
        px={4}
      >
        <Box>
          <Text>正确请按</Text>
          <Button
            borderRadius={'3xl'}
            colorScheme={'green'}
            mt={2}
            p={4}
            h="auto"
          >
            <Icon w={8} h={8} as={FiCheck} />
          </Button>
        </Box>
        <Box>
          <Text>错误请按</Text>
          <Button
            borderRadius={'3xl'}
            colorScheme={'red'}
            mt={2}
            p={4}
            h="auto"
          >
            <Icon w={8} h={8} as={FiX} />
          </Button>
        </Box>
        <Box>
          <Text>不确定请按</Text>
          <Button
            borderRadius={'3xl'}
            colorScheme={'yellow'}
            mt={2}
            p={4}
            h="auto"
          >
            <Icon w={8} h={8} as={BsQuestion} />
          </Button>
        </Box>
      </Flex>
      <Center>
        <Input
          color={'black'}
          name="name"
          isRequired
          maxW={'96'}
          size="lg"
          bg={'white'}
          placeholder="请输入你的姓名"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Center>
      <Box as={Center}>
        <Button
          type="submit"
          colorScheme={'teal'}
          borderRadius={'full'}
          h="120px"
          w="120px"
          size="lg"
          fontSize={'2xl'}
        >
          开始游戏
        </Button>
      </Box>
    </Grid>
  );
}
