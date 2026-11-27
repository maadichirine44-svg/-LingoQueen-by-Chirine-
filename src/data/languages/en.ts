import { buildLessonsForLanguage, LessonBlueprint } from '../curriculumBuilder';
import { Lesson } from '../../types';
import { EN_PART_1 } from './enPart1';
import { EN_PART_2 } from './enPart2';
import { EN_PART_3 } from './enPart3';

const ALL_ENGLISH_BLUEPRINTS: LessonBlueprint[] = [
  ...EN_PART_1,
  ...EN_PART_2,
  ...EN_PART_3,
];

export const ENGLISH_LESSONS: Lesson[] = buildLessonsForLanguage(
  'en',
  ALL_ENGLISH_BLUEPRINTS
);
