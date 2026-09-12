import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("invite/:token", "routes/invite.tsx"),
  route("reset-password/:token", "routes/reset-password.tsx"),
  route("users", "routes/users.tsx"),
  route("topics", "routes/topics.tsx"),
  route("topics/:topicId", "routes/topic.tsx"),
  route("practice-sets", "routes/practice-sets.tsx"),
  route("practice-sets/:practiceSetId", "routes/practice-set.tsx"),
  route("practice", "routes/practice.tsx"),
  route("practice/:practiceSetId", "routes/practice-run.tsx"),
] satisfies RouteConfig;
