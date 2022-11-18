import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Heading,
  HStack,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import { useMatches, useTransition } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useState } from "react";
import { ValidatedForm } from "remix-validated-form";
import z from "zod";
import { Action } from "~/routes/admin";
import { FormInput, FormSubmitButton } from "~/ui";

export const passwordValidator = withZod(
  z
    .object({
      currentPassword: z.string().min(1, "请输入当前密码"),
      password: z.string().min(1, "请输入新密码"),
      confirmPassword: z.string().min(1, "请输入确认密码"),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          path: ["confirmPassword"],
          code: "custom",
          message: "新密码和确认密码不一致",
        });
      }
    })
);

const Account = () => {
  const matches = useMatches();
  const transition = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const isLoading = transition.state !== "idle";
  const user = matches[1].data.user;
  return (
    <Box w={"500px"} py={50} borderRadius={5}>
      <ValidatedForm
        validator={passwordValidator}
        disableFocusOnError={false}
        replace={true}
        method={"post"}
        action={"/admin"}
      >
        <Heading pb={4} size="lg" as={HStack}>
          <Text>{user.username}</Text>
          <Text mx={2}>|</Text>
          <Text>{user.name}</Text>
        </Heading>
        <Box pb={4}>
          <FormInput
            label="当前密码"
            name="currentPassword"
            type={showPassword ? "text" : "password"}
            placeholder={"请输入密码"}
          >
            <InputRightElement h={"full"}>
              <Button
                variant={"ghost"}
                onClick={() => setShowPassword((showPassword) => !showPassword)}
              >
                {showPassword ? <ViewIcon /> : <ViewOffIcon />}
              </Button>
            </InputRightElement>
          </FormInput>
        </Box>
        <Box pb={4}>
          <FormInput
            label="新密码"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={"请输入密码"}
          >
            <InputRightElement h={"full"}>
              <Button
                variant={"ghost"}
                onClick={() => setShowPassword((showPassword) => !showPassword)}
              >
                {showPassword ? <ViewIcon /> : <ViewOffIcon />}
              </Button>
            </InputRightElement>
          </FormInput>
        </Box>
        <Box pb={10}>
          <FormInput
            label="确认密码"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder={"请输入密码"}
          >
            <InputRightElement h={"full"}>
              <Button
                variant={"ghost"}
                onClick={() => setShowPassword((showPassword) => !showPassword)}
              >
                {showPassword ? <ViewIcon /> : <ViewOffIcon />}
              </Button>
            </InputRightElement>
          </FormInput>
        </Box>
        <FormSubmitButton
          type="submit"
          w={"full"}
          isLoading={isLoading}
          name={"_action"}
          value={Action.UPDATE_PASSWORD}
          colorScheme="blue"
        >
          修改密码
        </FormSubmitButton>
      </ValidatedForm>
    </Box>
  );
};

export default Account;
