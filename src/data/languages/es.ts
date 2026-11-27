import { buildLessonsForLanguage, LessonBlueprint } from '../curriculumBuilder';
import { Lesson } from '../../types';
import { ES_PART_1 } from './esPart1';
import { ES_PART_2 } from './esPart2';
import { ES_PART_3 } from './esPart3';

const ALL_SPANISH_BLUEPRINTS: LessonBlueprint[] = [
  ...ES_PART_1,
  ...ES_PART_2,
  ...ES_PART_3,
];

export const SPANISH_LESSONS: Lesson[] = buildLessonsForLanguage(
  'es',
  ALL_SPANISH_BLUEPRINTS
);
