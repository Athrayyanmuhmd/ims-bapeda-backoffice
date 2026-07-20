import Illustrations from "./illustrations";
import LoginForm from "./login-form";

export default function Container() {
  return (
    <section className="bg-muted min-h-screen w-full">
      <div className="min-h-screen w-full p-4">
        <div className="grid min-h-[calc(100vh-2rem)] w-full grid-cols-1 gap-4 lg:grid-cols-3">
          <Illustrations />
          <LoginForm />
        </div>
      </div>
    </section>
  );
}
