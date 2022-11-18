import {
  Box, Button, Center,
  DarkMode,
  InputRightElement,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { ActionArgs } from '@remix-run/node';
import {
  useTransition,
} from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import React, { useState } from 'react';
import { ValidatedForm, validationError } from 'remix-validated-form';
import z from 'zod';
import { FormInput, FormSubmitButton } from '~/ui';
import { createAdminUserSession } from '~/session.server';
import { verifyLogin } from '~/models/admin.server';

export const action = async ({ request }: ActionArgs) => {
  let formData = await request.formData();
  const result = await validator.validate(formData);
  if (result.error) {
    return validationError(result.error);
  }
  const { email, password } = result.data;
  const user = await verifyLogin(email, password);
  if (!user) {
    return validationError(
      { fieldErrors: { password: "账号或密码错误" } },
      result.submittedData,
      { status: 401 }
    );
  }
  return createAdminUserSession({
    request,
    userId: user.id.toString(),
    redirectTo: '/admin',
  });
};

const validator = withZod(z.object({
  email: z.string().min(1, '请输入账号'),
  password: z.string().min(1, '请输入密码')
}));
export default function Login() {
  const transition = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const isLoading = transition.state !== 'idle';
  return (
    <DarkMode>
      <Box
        bg={'gray.900'}
        h="full"
        w={'full'}
      >
        <Center h={'full'}>
          <Box w={'500px'} mt={-100} borderWidth={1} borderColor={'gray'} p={50} borderRadius={5}>
            <ValidatedForm
              validator={validator}
              disableFocusOnError={false}
              replace={true}
              method={'post'}
              action={'/login'}
            >
              <Box pb={6}>
                <FormInput
                  name="email"
                  label="账号"
                  placeholder="请输入账号"
                  autoComplete="off"
                />
              </Box>
              <Box pb={10}>
                <FormInput
                  label="密码"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={'请输入密码'}
                >
                  <InputRightElement h={"full"}>
                    <Button
                      variant={"ghost"}
                      onClick={() =>
                        setShowPassword((showPassword) => !showPassword)
                      }
                    >
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </FormInput>
              </Box>
              <FormSubmitButton
                type="submit"
                w={'full'}
                isLoading={isLoading}
                colorScheme="blue"
              >
                登录
              </FormSubmitButton>
            </ValidatedForm>
          </Box>
        </Center>
      </Box>
    </DarkMode>
  );
}
