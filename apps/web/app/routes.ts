import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("topics", "routes/topics.tsx"),
  route("topics/:topicId", "routes/topic.tsx"),
] satisfies RouteConfig;
