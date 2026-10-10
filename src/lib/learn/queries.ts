// NOTE: Current behavior: these queries read local arrays, not published database content.
// TODO: Enforce session/publication visibility when integrating the content store.
// See docs/developer-guide.md, Learn and Data integration.

import {
  topics,
  subjects,
  materials,
} from "./data";

export function getTopics() {
  return topics;
}

export function getTopic(topicId: string) {
  return topics.find(
    (topic) => topic.id === topicId
  );
}

export function getSubjectsByTopic(topicId: string) {
  return subjects.filter(
    (subject) => subject.topicId === topicId
  );
}

export function getMaterial(
  topicId: string,
  subjectId: string
) {
  return materials.find(
    (material) =>
      material.topicId === topicId &&
      material.subjectId === subjectId
  );
}