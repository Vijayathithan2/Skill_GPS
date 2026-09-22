"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Student } from "@/lib/students";
import { BACKEND_URL } from "@/lib/api-client";

// Default student profile used as resilient fallback when backend or Firebase is offline
const DEFAULT_STUDENT: Student = {
    id: "STU0001",
    name: "Arjun Sharma",
    email: "arjun.sharma@srmist.edu.in",
    regNo: "RA2111003010001",
    college: "SRM Institute of Science and Technology",
    department: "Computer Science & Engineering",
    year: 3,
    semester: 5,
    section: "A",
    cgpa: 8.4,
    careerTarget: "AI Engineer",
    careerProbability: 78,
    joinedDate: "2022-08-01",
    attendance: 88,
    projectsCompleted: 3,
    internships: 1,
    githubUsername: "arjun-sharma",
    leetcodeUsername: "arjun_codes",
    skillrackUsername: "arjun_sr",
    leetcodeRank: 1420,
    leetcodeStreak: 18,
    skillrackStreak: 25,
    githubStreak: 12,
    totalXP: 2450,
    level: 4,
    badges: [
        { title: "Problem Solver", color: "from-blue-500 to-indigo-600", date: "2024-01-15", desc: "Solved 100+ DSA problems" },
        { title: "Streak Master", color: "from-amber-500 to-orange-600", date: "2024-02-10", desc: "Maintained a 15-day streak" },
    ],
    skillGaps: [
        { skill: "System Design", score: 45, color: "#EF4444" },
        { skill: "Docker & Kubernetes", score: 55, color: "#F59E0B" },
        { skill: "DSA & Algorithms", score: 85, color: "#10B981" },
        { skill: "React & Next.js", score: 90, color: "#3B82F6" },
    ],
    semesterGoals: [
        { id: 1, text: "Solve 50 LeetCode Medium problems", done: true },
        { id: 2, text: "Build and deploy fullstack AI project", done: false },
        { id: 3, text: "Earn AWS Cloud Practitioner certification", done: false },
    ],
    recentActivity: [
        { type: "code", title: "Solved 'LRU Cache' on LeetCode", date: "Today", icon: "Code" },
        { type: "project", title: "Pushed 4 commits to Skill_GPS", date: "Yesterday", icon: "GitCommit" },
    ],
    certificates: [],
};

type StudentContextType = {
    student: Student;
    setStudent: (student: Student) => void;
    setStudentById: (id: string) => void;
    allStudents: Student[];
    isLoading: boolean;
};

const StudentContext = createContext<StudentContextType | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
    const [students, setStudents] = useState<Student[]>([DEFAULT_STUDENT]);
    const [student, setStudent] = useState<Student>(DEFAULT_STUDENT);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFromNode = async (id: string) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(`${BACKEND_URL}/students/${id}`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                setStudent(data);
                setStudents(prev => {
                    const exists = prev.find(s => s.id === data.id);
                    if (exists) return prev.map(s => s.id === data.id ? data : s);
                    return [...prev, data];
                });
                return true;
            }
        } catch {
            // Backend offline or unreachable — gracefully fall back to local demo profile
            console.info("ℹ️ Backend server (http://localhost:5000) not reached. Using demo profile.");
        }
        return false;
    };

    useEffect(() => {
        let unsubscribeAuth: () => void = () => {};
        let unsubscribeDB: () => void = () => {};

        const init = async () => {
            const savedId = localStorage.getItem("skillgps_student_id") || "STU0001";
            const nodeSuccess = await fetchFromNode(savedId);
            
            if (nodeSuccess) {
                setIsLoading(false);
            }

            try {
                const { collection, doc, onSnapshot } = await import("firebase/firestore");
                const { onAuthStateChanged } = await import("firebase/auth");
                const { db, auth } = await import("@/lib/firebase");

                unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
                    if (!user) {
                        setIsLoading(false);
                        return;
                    }

                    // Firebase user exists
                    const studentRef = doc(db, "students", user.uid);
                    unsubscribeDB = onSnapshot(studentRef, (snap) => {
                        if (snap.exists()) {
                            const data = { ...(snap.data() as Student), id: snap.id };
                            setStudent(data);
                            localStorage.setItem("skillgps_student_id", user.uid);
                        } else if (!nodeSuccess) {
                            const studentsCol = collection(db, "students");
                            onSnapshot(studentsCol, (colSnap) => {
                                const all = colSnap.docs.map(d => ({ ...(d.data() as Student), id: d.id }));
                                const found = all.find(s => s.email?.toLowerCase() === user.email?.toLowerCase());
                                if (found) {
                                    setStudent(found);
                                    localStorage.setItem("skillgps_student_id", found.id);
                                }
                            });
                        }
                        setIsLoading(false);
                    }, () => { setIsLoading(false); });
                });
            } catch {
                // Firebase not initialized or offline
                setIsLoading(false);
            }
        };

        init();

        return () => {
            unsubscribeAuth();
            unsubscribeDB();
        };
    }, []);

    const setStudentById = async (id: string) => {
        const success = await fetchFromNode(id);
        if (success) {
            localStorage.setItem("skillgps_student_id", id);
        } else {
            const found = students.find(s => s.id === id);
            if (found) {
                setStudent(found);
                localStorage.setItem("skillgps_student_id", id);
            }
        }
    };

    return (
        <StudentContext.Provider value={{ student, setStudent, setStudentById, allStudents: students, isLoading }}>
            {children}
        </StudentContext.Provider>
    );
}

export function useStudent() {
    const ctx = useContext(StudentContext);
    if (!ctx) throw new Error("useStudent must be used within StudentProvider");
    return ctx;
}
