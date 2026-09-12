import type { Route } from "./+types/home";
import { Form, Link } from "react-router";
import { Welcome } from "../welcome/welcome";
import { requireAuth } from "../content-api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}
export async function clientLoader() { return { user: await requireAuth() }; }

export default function Home({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return <><nav className="content-admin"><Link to="/practice">Start practice</Link>{user.role === "Admin" && <> · <Link to="/topics">Manage topics and materials</Link> · <Link to="/practice-sets">Manage practice sets</Link> · <Link to="/users">Participants</Link></>} · <Form method="post" action="/logout" className="inline"><button type="submit">Log out</button></Form></nav><Welcome /></>;
}
