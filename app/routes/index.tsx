// app/routes/index.tsx
import { redirect } from "react-router";

export async function loader() {
    return redirect("/home");
}

export default function Index() {
    return null;
}