import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="CA Console - Sign In"
        description="Enter your email and password to sign in to your CA Console account"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
