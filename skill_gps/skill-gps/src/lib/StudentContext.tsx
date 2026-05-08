"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Student } from "@/lib/students";
import { BACKEND_URL } from "@/lib/api-client";

// Blank student shape used as a safe initial value while data loads
const BLANK_STUDENT: Student = {
    id: "", name: "Loading...", email: "", regNo: "", college: "", department: "",
    year: 1, semester: 1, section: "A", cgpa: 0,
    careerTarget: "", careerProbability: 50, joinedDate: "", attendance: 0,
    projectsCompleted: 0, internships: 0, githubUsername: "", 
    leetcodeUsername: "", skillrackUsername: "",
    leetcodeRank: 0,
    leetcodeStreak: 0, skillrackStreak: 0, githubStreak: 0, totalXP: 0, level: 1,
    badges: [], skillGaps: [], semesterGoals: [], recentActivity: [], certificates: [],
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
    const [students, setStudents] = useState<Student[]>([]);
    const [student, setStudent] = useState<Student>(BLANK_STUDENT);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFromNode = async (id: string) => {
        try {
            const res = await fetch(`${BACKEND_URL}/students/${id}`);
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
        } catch (e) {
            console.error("Backend fetch error:", e);
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
                // Even if node succeeded, we can still listen to auth in background if needed
            }

            try {
                const { collection, doc, onSnapshot } = await import("firebase/firestore");
                const { onAuthStateChanged } = await import("firebase/auth");
                const { db, auth } = await import("@/lib/firebase");

                unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
                    if (!user) {
                        if (!nodeSuccess) setIsLoading(false);
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
                            // Only fall back to email search if node also failed
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
                    }, () => { if (!nodeSuccess) setIsLoading(false); });
                });
            } catch (fireErr) {
                console.warn("Firebase not configured or reachable.");
                if (!nodeSuccess) setIsLoading(false);
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
