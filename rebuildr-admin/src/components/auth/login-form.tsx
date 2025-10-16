"use client";

import AdminForm from "@/components/admin-form";
import FormField from "@/components/form-field";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, App, Input } from "antd";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { LoginSchema, LoginSchemaType } from "@/schema/login-schema";
import { useRouter } from "next/navigation";
import { login } from "@/actions/auth";
import { routes } from "@/lib/routes";
import { useMutation } from "@tanstack/react-query";

const LoginForm = () => {
  const router = useRouter();
  const { notification } = App.useApp();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
  });

  const { mutate: onLogin, isPending } = useMutation({
    mutationFn: async (formData: LoginSchemaType) => {
      const { success } = await login(formData);
      if (!success) throw new Error();
      return success;
    },
    onSuccess: async () => {
      router.push(routes.ADMIN);
    },
    onError: () => {
      notification.error({
        message: "Tyvärr!",
        description: "Inloggningen misslyckades.",
      });
    },
  });

  return (
    <div className="flex h-screen w-screen items-center justify-center p-3">
      <div className="w-full max-w-[400px]">
        <AdminForm
          title="Vänligen logga in"
          onSubmit={handleSubmit((formData) => onLogin(formData))}
        >
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <FormField label="Email" error={errors.email?.message}>
                <Input
                  prefix={<MailOutlined />}
                  size="large"
                  placeholder={"Email ..."}
                  autoComplete="username"
                  value={value}
                  onChange={onChange}
                />
              </FormField>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <FormField label="Lösenord" error={errors.password?.message}>
                <Input.Password
                  prefix={<LockOutlined />}
                  size="large"
                  placeholder={"Lösenord ..."}
                  autoComplete="current-password"
                  value={value}
                  onChange={onChange}
                />
              </FormField>
            )}
          />

          <Button
            size="large"
            type="primary"
            htmlType="submit"
            loading={isPending}
          >
            Logga in
          </Button>
        </AdminForm>
      </div>
    </div>
  );
};

export default LoginForm;
