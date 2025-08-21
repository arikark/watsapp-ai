import { redirect } from "react-router";

export async function loader() {
  return redirect("/welcome");
}

export default function Component() {
  return null;
}
