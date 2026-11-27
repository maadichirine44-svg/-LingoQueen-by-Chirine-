import { buildLessonsForLanguage, LessonBlueprint } from '../curriculumBuilder';
import { Lesson } from '../../types';
import { FR_PART_1 } from './frPart1';
import { FR_PART_2 } from './frPart2';
import { FR_PART_3 } from './frPart3';

const ALL_FRENCH_BLUEPRINTS: LessonBlueprint[] = [
  ...FR_PART_1,
  ...FR_PART_2,
  ...FR_PART_3,
];

export const FRENCH_LESSONS: Lesson[] = buildLessonsForLanguage(
  'fr',
  ALL_FRENCH_BLUEPRINTS
);
