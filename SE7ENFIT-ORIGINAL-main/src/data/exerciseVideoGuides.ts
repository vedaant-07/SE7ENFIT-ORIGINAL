export type ExerciseVideoGuide = {
  id: string;
  name: string;
  muscleGroup: string;
  targetMuscles: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  sets: number;
  reps: number;
  restSec: number;
  videoUrl: string;
  thumbnailUrl: string;
  tips: string[];
  mistakes: string[];
  adminMeta: {
    source: 'cdn' | 'admin_upload' | 'licensed_library';
    contentStatus: 'placeholder' | 'ready' | 'needs_review';
    videoKey: string;
  };
};

export const EXERCISE_VIDEO_GUIDES: ExerciseVideoGuide[] = [
  {
    id: 'bench-press',
    name: 'Bench Press',
    muscleGroup: 'Chest',
    targetMuscles: ['Chest', 'Front Delts', 'Triceps'],
    equipment: 'Barbell, Bench',
    difficulty: 'Intermediate',
    sets: 4,
    reps: 10,
    restSec: 90,
    videoUrl: '',
    thumbnailUrl: '',
    tips: ['Retract shoulder blades', 'Lower the bar under control', 'Press with stable wrists'],
    mistakes: ['Bouncing the bar', 'Flaring elbows too wide', 'Lifting hips off the bench'],
    adminMeta: { source: 'cdn', contentStatus: 'placeholder', videoKey: 'bench-press.mp4' },
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    targetMuscles: ['Upper Chest', 'Front Delts', 'Triceps'],
    equipment: 'Dumbbells, Incline Bench',
    difficulty: 'Intermediate',
    sets: 3,
    reps: 12,
    restSec: 75,
    videoUrl: '',
    thumbnailUrl: '',
    tips: ['Use a controlled stretch', 'Keep shoulders down', 'Press in a smooth arc'],
    mistakes: ['Going too heavy', 'Shrugging shoulders', 'Short range of motion'],
    adminMeta: { source: 'cdn', contentStatus: 'placeholder', videoKey: 'incline-dumbbell-press.mp4' },
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    targetMuscles: ['Lats', 'Biceps', 'Rear Delts'],
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    sets: 4,
    reps: 12,
    restSec: 75,
    videoUrl: '',
    thumbnailUrl: '',
    tips: ['Pull elbows down and back', 'Keep chest tall', 'Pause at the bottom'],
    mistakes: ['Pulling behind neck', 'Using momentum', 'Leaning too far back'],
    adminMeta: { source: 'cdn', contentStatus: 'placeholder', videoKey: 'lat-pulldown.mp4' },
  },
  {
    id: 'goblet-squat',
    name: 'Goblet Squat',
    muscleGroup: 'Legs',
    targetMuscles: ['Quads', 'Glutes', 'Core'],
    equipment: 'Dumbbell or Kettlebell',
    difficulty: 'Beginner',
    sets: 3,
    reps: 15,
    restSec: 60,
    videoUrl: '',
    thumbnailUrl: '',
    tips: ['Keep elbows inside knees', 'Drive knees out', 'Stay tall through chest'],
    mistakes: ['Knees collapsing inward', 'Heels lifting', 'Rounding lower back'],
    adminMeta: { source: 'cdn', contentStatus: 'placeholder', videoKey: 'goblet-squat.mp4' },
  },
];

export const getExerciseGuideById = (id: string) => EXERCISE_VIDEO_GUIDES.find((guide) => guide.id === id);
