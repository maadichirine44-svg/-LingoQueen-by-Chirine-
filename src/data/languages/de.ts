import { buildLessonsForLanguage, LessonBlueprint } from '../curriculumBuilder';
import { Lesson } from '../../types';
import { DE_PART_1 } from './dePart1';
import { DE_PART_2 } from './dePart2';
import { DE_PART_3 } from './dePart3';

const ALL_GERMAN_BLUEPRINTS: LessonBlueprint[] = [...DE_PART_1, ...DE_PART_2, ...DE_PART_3];

export const GERMAN_LESSONS: Lesson[] = buildLessonsForLanguage('de', ALL_GERMAN_BLUEPRINTS);
