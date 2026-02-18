window.AIC_SMS_SEED = {
  school: {
    name: "AIC KOSIRAI ACADEMY",
    motto: "Discipline. Excellence. Service."
  },
  subjects: [
    "Mathematics",
    "English",
    "Kiswahili",
    "CRE",
    "Social Studies",
    "Creative Arts and Sports",
    "Integrated Science",
    "Pre technical Studies",
    "Agriculture"
  ],
  classes: ["JSS 1", "JSS 2", "JSS 3"],
  users: {
    teacher: { username: "teacher", password: "1234", role: "teacher", fullName: "Teacher Account" },
    student: { username: "student", password: "1234", role: "student", fullName: "Student Account", className: "JSS 2" }
  },
  announcements: [
    { id: "a1", title: "Opening Day", body: "Term opens on Monday. Report by 7:30 AM in full uniform.", pinned: true, createdAt: Date.now() - 86400000 * 2 },
    { id: "a2", title: "Agriculture Practical", body: "Bring a small jembe and gloves for the school garden activity.", pinned: false, createdAt: Date.now() - 86400000 }
  ],
  materials: [
    { id: "m1", subject: "Mathematics", className: "JSS 2", title: "Algebra Basics Notes", description: "Expressions, simplification, and basic equations.", fileName: "algebra_notes.pdf", createdAt: Date.now() - 86400000 * 3 },
    { id: "m2", subject: "Integrated Science", className: "JSS 2", title: "Lab Safety Rules", description: "Safety symbols and best practice.", fileName: "lab_safety.pdf", createdAt: Date.now() - 86400000 * 4 }
  ],
  assignments: [
    { id: "as1", subject: "English", className: "JSS 2", title: "Comprehension Passage", instructions: "Read the passage and answer questions 1 to 10.", dueAt: Date.now() + 86400000 * 3, createdAt: Date.now() - 86400000 },
    { id: "as2", subject: "Mathematics", className: "JSS 2", title: "Linear Equations", instructions: "Solve questions 1 to 15. Show all steps.", dueAt: Date.now() + 86400000 * 5, createdAt: Date.now() - 86400000 * 2 }
  ],
  submissions: [
    { id: "s1", assignmentId: "as1", student: "student", fileName: "english_work.docx", note: "Submitted.", submittedAt: Date.now() - 3600000 * 6, grade: 78, feedback: "Good effort. Improve inference answers." }
  ],
  results: [
    { id: "r1", term: "Term 1 2026", student: "student", className: "JSS 2",
      marks: {
        "Mathematics": 82,
        "English": 76,
        "Kiswahili": 71,
        "CRE": 88,
        "Social Studies": 74,
        "Creative Arts and Sports": 90,
        "Integrated Science": 79,
        "Pre technical Studies": 84,
        "Agriculture": 86
      },
      published: true,
      createdAt: Date.now() - 86400000 * 7
    }
  ],
  timetable: [
    { id: "t1", className: "JSS 2", day: "Monday", slot: "08:00 - 08:40", subject: "Mathematics" },
    { id: "t2", className: "JSS 2", day: "Monday", slot: "08:40 - 09:20", subject: "English" },
    { id: "t3", className: "JSS 2", day: "Monday", slot: "09:20 - 10:00", subject: "Integrated Science" },
    { id: "t4", className: "JSS 2", day: "Tuesday", slot: "08:00 - 08:40", subject: "Kiswahili" },
    { id: "t5", className: "JSS 2", day: "Tuesday", slot: "08:40 - 09:20", subject: "Agriculture" }
  ],
  activities: [
    { id: "c1", title: "Football Training", day: "Wednesday", time: "4:00 PM", venue: "School Field" },
    { id: "c2", title: "Music and Drama Club", day: "Thursday", time: "4:00 PM", venue: "Hall" },
    { id: "c3", title: "Science Club", day: "Friday", time: "4:00 PM", venue: "Lab" }
  ]
};
