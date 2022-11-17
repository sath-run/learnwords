import { Box, Button, Center, Container, Heading, Text } from '@chakra-ui/react';
import { Link, useParams } from '@remix-run/react';
import { useUserName } from '~/hooks';

export default function () {
  const userName = useUserName();
  const { assignmentId } = useParams();
  return (
    <Box h={'full'} w={'full'} textAlign={'center'}>
      <Heading w={'full'} pt={'30vh'}>
        恭喜你:{' '}
        <Text color={'yellow'} as="span">
          {userName}
        </Text>
        <br />
        你已经完成了所有游戏
      </Heading>

      <Button mt={10} to={`/assignment/${assignmentId}/tasks/0`} as={Link} p={8} size="lg" colorScheme={'teal'}>
        再玩一次
      </Button>
    </Box>
  );
}
