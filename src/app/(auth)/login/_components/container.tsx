import Illustrations from "./illustrations";
import LoginForm from "./login-form";

export default function Container() {
  return (
    <section className="bg-muted h-screen w-full">
      <div className="h-full w-full p-4">
        <div className="grid h-full w-full grid-cols-1 gap-4 lg:grid-cols-3">
          <Illustrations />
          <LoginForm />
        </div>
      </div>
    </section>
  );
}
