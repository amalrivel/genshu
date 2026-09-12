import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("invite/:token", "routes/invite.tsx"),
  route("reset-password/:token", "routes/reset-password.tsx"),
  layout("routes/app-layout.tsx", [
    index("routes/home.tsx"),
    route("dashboard", "routes/dashboard.tsx"),
    route("users", "routes/users.tsx"),
    route("topics", "routes/topics.tsx"),
    route("topics/:topicId", "routes/topic.tsx"),
    route("questions", "routes/questions.tsx"),
    route("practice-sets", "routes/practice-sets.tsx"),
    route("practice-sets/:practiceSetId", "routes/practice-set.tsx"),
    route("practice", "routes/practice.tsx"),
    route("practice/:practiceSetId", "routes/practice-run.tsx"),
  ]),
] satisfies RouteConfig;
