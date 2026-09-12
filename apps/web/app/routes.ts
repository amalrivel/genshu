import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("topics", "routes/topics.tsx"),
  route("topics/:topicId", "routes/topic.tsx"),
  route("practice-sets", "routes/practice-sets.tsx"),
  route("practice-sets/:practiceSetId", "routes/practice-set.tsx"),
] satisfies RouteConfig;
