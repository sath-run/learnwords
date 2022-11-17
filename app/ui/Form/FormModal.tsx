import { Modal, ModalProps } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { FormProps, ValidatedForm } from "remix-validated-form";

export type FormModalProps<DataType> = Omit<
  ModalProps & FormProps<DataType>,
  "fetcher" | "onClose"
> & {
  onClose: (data: { success: boolean; data?: any }) => void;
};

export default function FormModal<DataType>({
  onClose,

  id,
  children,
  validator,
  onSubmit,
  defaultValue,
  formRef,
  subaction,
  resetAfterSubmit,
  disableFocusOnError,
  noValidate,

  replace,
  method,
  action,

  ...rest
}: FormModalProps<DataType>) {
  const fetcher = useFetcher();
  const close = () => {
    if (fetcher.state === "idle") {
      fetcher.data = undefined;
      onClose({
        success: false,
      });
    }
  };
  useEffect(() => {
    if (fetcher.type === "done") {
      if (!fetcher.data?.fieldErrors) {
        onClose({
          success: true,
          data: fetcher.data,
        });
      }
    }
  }, [fetcher.type]);

  return (
    <Modal onClose={close} {...rest}>
      <ValidatedForm
        id={id}
        validator={validator}
        onSubmit={onSubmit}
        fetcher={fetcher}
        defaultValue={defaultValue}
        formRef={formRef}
        subaction={subaction}
        resetAfterSubmit={resetAfterSubmit}
        disableFocusOnError={disableFocusOnError}
        replace={replace}
        method={method}
        action={action}
        noValidate={noValidate}
      >
        {children}
      </ValidatedForm>
    </Modal>
  );
}
