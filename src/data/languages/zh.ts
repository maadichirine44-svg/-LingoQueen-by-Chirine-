import { buildLessonsForLanguage, LessonBlueprint } from '../curriculumBuilder';
import { Lesson } from '../../types';
import { ZH_PART_1 } from './zhPart1';
import { ZH_PART_2 } from './zhPart2';
import { ZH_PART_3 } from './zhPart3';

const ALL_CHINESE_BLUEPRINTS: LessonBlueprint[] = [...ZH_PART_1, ...ZH_PART_2, ...ZH_PART_3];

export const CHINESE_LESSONS: Lesson[] = buildLessonsForLanguage('zh', ALL_CHINESE_BLUEPRINTS);
