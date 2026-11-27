import { buildLessonsForLanguage, LessonBlueprint } from '../curriculumBuilder';
import { Lesson } from '../../types';
import { IT_PART_1 } from './itPart1';
import { IT_PART_2 } from './itPart2';
import { IT_PART_3 } from './itPart3';

const ALL_ITALIAN_BLUEPRINTS: LessonBlueprint[] = [...IT_PART_1, ...IT_PART_2, ...IT_PART_3];

export const ITALIAN_LESSONS: Lesson[] = buildLessonsForLanguage('it', ALL_ITALIAN_BLUEPRINTS);
