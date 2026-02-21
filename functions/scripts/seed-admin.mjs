#!/usr/bin/env node
import admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID;
const coachEmail = process.env.SEED_COACH_EMAIL || 'coach@example.com';
const athleteEmail = process.env.SEED_ATHLETE_EMAIL || 'athlete@example.com';

if (!admin.apps.length) {
  admin.initializeApp(projectId ? { projectId } : undefined);
}

const db = admin.firestore();

const coachId = 'seed-coach-001';
const athleteId = 'seed-athlete-001';
const programId = 'seed-program-001';
const assignmentId = 'seed-assignment-001';

const exercises = [
  {
    id: 'seed-exercise-back-squat',
    name: 'Back Squat',
    pattern: 'squat'
  },
  {
    id: 'seed-exercise-bench-press',
    name: 'Bench Press',
    pattern: 'push'
  },
  {
    id: 'seed-exercise-deadlift',
    name: 'Deadlift',
    pattern: 'hinge'
  }
];

const now = admin.firestore.FieldValue.serverTimestamp();

async function seed() {
  const batch = db.batch();

  const coachRef = db.collection('users').doc(coachId);
  batch.set(coachRef, {
    role: 'coach',
    email: coachEmail,
    displayName: 'Sample Coach',
    timezone: process.env.TZ || 'America/New_York',
    createdAt: now,
    updatedAt: now
  }, { merge: true });

  const athleteRef = db.collection('users').doc(athleteId);
  batch.set(athleteRef, {
    role: 'athlete',
    email: athleteEmail,
    displayName: 'Sample Athlete',
    coachId,
    timezone: process.env.TZ || 'America/New_York',
    createdAt: now,
    updatedAt: now
  }, { merge: true });

  for (const exercise of exercises) {
    const exerciseRef = db.collection('exercises').doc(exercise.id);
    batch.set(exerciseRef, {
      ...exercise,
      coachId,
      createdAt: now,
      updatedAt: now
    }, { merge: true });
  }

  const programRef = db.collection('programs').doc(programId);
  batch.set(programRef, {
    coachId,
    name: 'MVP Strength On-Ramp',
    description: '2-day weekly progression for onboarding athletes.',
    status: 'active',
    weeks: 4,
    createdAt: now,
    updatedAt: now
  }, { merge: true });

  const workoutARef = db.collection('program_workouts').doc('seed-program-workout-001');
  batch.set(workoutARef, {
    coachId,
    programId,
    dayIndex: 1,
    name: 'Day 1 - Squat + Press',
    exerciseIds: ['seed-exercise-back-squat', 'seed-exercise-bench-press'],
    createdAt: now,
    updatedAt: now
  }, { merge: true });

  const workoutBRef = db.collection('program_workouts').doc('seed-program-workout-002');
  batch.set(workoutBRef, {
    coachId,
    programId,
    dayIndex: 3,
    name: 'Day 3 - Pull Focus',
    exerciseIds: ['seed-exercise-deadlift', 'seed-exercise-bench-press'],
    createdAt: now,
    updatedAt: now
  }, { merge: true });

  const assignmentRef = db.collection('program_assignments').doc(assignmentId);
  batch.set(assignmentRef, {
    coachId,
    athleteId,
    programId,
    status: 'active',
    startDate: '2026-01-05',
    timezone: process.env.TZ || 'America/New_York',
    source: 'seed-admin-script',
    createdAt: now,
    updatedAt: now
  }, { merge: true });

  await batch.commit();

  console.log('Seed complete');
  console.log(JSON.stringify({ coachId, athleteId, programId, assignmentId, exercises: exercises.map((e) => e.id) }, null, 2));
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
