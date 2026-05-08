"use client";
import React, { useRef } from "react";
import { useStudent } from "@/lib/StudentContext";
import { Download, Briefcase, GraduationCap, Code, Award, ExternalLink, Github, Trophy, Upload, Sparkles, AlertCircle, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function ResumePage() {
    const { student } = useStudent();
    const resumeRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = React.useState<"generate" | "optimize">("generate");
    
    // Optimizer States
    const [isOptimizing, setIsOptimizing] = React.useState(false);
    const [optimizationData, setOptimizationData] = React.useState<any>(null);
    const [uploadError, setUploadError] = React.useState<string | null>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleOptimize = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsOptimizing(true);
        setUploadError(null);
        setOptimizationData(null);

        try {
            // 1. Convert PDF to Text
            const formData = new FormData();
            formData.append("file", file);
            
            const textRes = await fetch("/api/pdf-to-text", { method: "POST", body: formData });
            if (!textRes.ok) throw new Error("Could not read PDF. Ensure it's not password protected.");
            const { text } = await textRes.json();

            // 2. Send to Optimizer
            const optRes = await fetch("/api/resume-optimizer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeText: text, targetRole: student.careerTarget })
            });
            
            if (!optRes.ok) throw new Error("AI analysis failed. Please try again.");
            const optData = await optRes.json();
            setOptimizationData(optData);

        } catch (err: any) {
            setUploadError(err.message);
        } finally {
            setIsOptimizing(false);
        }
    };

    if (!student || student.id === "") return <div className="p-10 text-center">Loading student data...</div>;

    return (
        <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60, animation: "fadeIn 0.5s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }} className="no-print">
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>Resume Intelligence</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Generate from profile or optimize your existing resume with AI.</p>
                </div>
                <div style={{ background: "var(--bg-tertiary)", padding: 4, borderRadius: 12, border: "1px solid var(--border-color)", display: "flex", gap: 4 }}>
                    <button 
                        onClick={() => setActiveTab("generate")}
                        style={{ 
                            padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600,
                            background: activeTab === "generate" ? "var(--bg-secondary)" : "transparent",
                            color: activeTab === "generate" ? "var(--text-primary)" : "var(--text-secondary)"
                        }}
                    >
                        Verified Generator
                    </button>
                    <button 
                        onClick={() => setActiveTab("optimize")}
                        style={{ 
                            padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600,
                            background: activeTab === "optimize" ? "var(--bg-secondary)" : "transparent",
                            color: activeTab === "optimize" ? "var(--text-primary)" : "var(--text-secondary)"
                        }}
                    >
                        ATS Optimizer
                    </button>
                </div>
            </div>

            {activeTab === "generate" ? (
                <>
                    <div style={{ textAlign: "right", marginBottom: 16 }} className="no-print">
                        <button 
                            onClick={handlePrint}
                            style={{ 
                                background: "var(--accent-primary, #3B82F6)", color: "white", border: "none", 
                                padding: "10px 24px", borderRadius: 12, fontWeight: 600, 
                                display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
                            }}
                        >
                            <Download size={18} /> Print as PDF
                        </button>
                    </div>

                    {/* RESUME PREVIEW CONTAINER */}
                    <div 
                        ref={resumeRef}
                        className="resume-container"
                        style={{ 
                            background: "white", 
                            color: "#1a1a1a", 
                            padding: "60px 50px", 
                            borderRadius: 4, 
                            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                            minHeight: "1120px", // A4 Ratio approximation
                            fontFamily: "Inter, sans-serif"
                        }}
                    >
                        <header style={{ borderBottom: "2px solid #3B82F6", paddingBottom: 24, marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                            <div>
                                <h1 style={{ fontSize: "2.8rem", fontWeight: 800, margin: 0, textTransform: "uppercase", letterSpacing: "-1px", color: "#111" }}>{student.name}</h1>
                                <p style={{ fontSize: "1.2rem", color: "#3B82F6", fontWeight: 600, marginTop: 4 }}>{student.careerTarget}</p>
                                <div style={{ display: "flex", gap: 15, marginTop: 12, fontSize: "0.9rem", color: "#666" }}>
                                    <span>{student.email}</span>
                                    <span>•</span>
                                    <span>{student.department}</span>
                                    <span>•</span>
                                    <span>Year {student.year}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: "right", fontSize: "0.85rem", color: "#666" }}>
                                <div>{student.college}</div>
                                <div style={{ fontWeight: 700, color: "#111", marginTop: 4 }}>GPA: {student.cgpa} / 10.0</div>
                            </div>
                        </header>

                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 40 }}>
                            {/* LEFT COLUMN */}
                            <main>
                                <section style={{ marginBottom: 32 }}>
                                    <h2 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.1rem", borderBottom: "1px solid #eee", paddingBottom: 8, marginBottom: 16, textTransform: "uppercase", fontWeight: 700, color: "#111" }}>
                                        <Code size={18} color="#3B82F6" /> Technical Skills
                                    </h2>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {student.skillGaps.map((s, i) => (
                                            <span key={i} style={{ background: "#f0f7ff", color: "#1e40af", padding: "4px 12px", borderRadius: 4, fontSize: "0.85rem", fontWeight: 600 }}>{s.skill}</span>
                                        ))}
                                        {student.skillGaps.length === 0 && <span style={{ color: "#666", fontSize: "0.9rem" }}>Communication, Aptitude, Critical Thinking</span>}
                                    </div>
                                </section>

                                <section style={{ marginBottom: 32 }}>
                                    <h2 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.1rem", borderBottom: "1px solid #eee", paddingBottom: 8, marginBottom: 16, textTransform: "uppercase", fontWeight: 700, color: "#111" }}>
                                        <Briefcase size={18} color="#3B82F6" /> Projects & Experience
                                    </h2>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                        {student.projectsCompleted > 0 ? (
                                            <div style={{ marginBottom: 10 }}>
                                                <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Full Stack Portfolio Lead</h3>
                                                <p style={{ fontSize: "0.85rem", color: "#666", margin: "4px 0" }}>Skill GPS Platform • 2024</p>
                                                <ul style={{ paddingLeft: 18, margin: "8px 0", fontSize: "0.9rem", color: "#444", lineHeight: 1.5 }}>
                                                    <li>Developed an AI-integrated career guidance platform using Next.js and API services.</li>
                                                    <li>Implemented real-time progress tracking and automated roadmaps for {student.department} students.</li>
                                                    <li>Managed version control and collaborative workflows via GitHub.</li>
                                                </ul>
                                            </div>
                                        ) : (
                                            <p style={{ fontSize: "0.9rem", color: "#666" }}>Currently working on core technical projects in {student.department}.</p>
                                        )}
                                        
                                        {student.internships > 0 && (
                                            <div>
                                                <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Technical Intern</h3>
                                                <p style={{ fontSize: "0.85rem", color: "#666", margin: "4px 0" }}>Tier-1 Tech Solutions • 2023</p>
                                                <ul style={{ paddingLeft: 18, margin: "8px 0", fontSize: "0.9rem", color: "#444", lineHeight: 1.5 }}>
                                                    <li>Assisted in building scalable backend services for internal analytics tools.</li>
                                                    <li>Optimized database queries decreasing load times by 15%.</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <h2 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.1rem", borderBottom: "1px solid #eee", paddingBottom: 8, marginBottom: 16, textTransform: "uppercase", fontWeight: 700, color: "#111" }}>
                                        <Award size={18} color="#3B82F6" /> Certification & Awards
                                    </h2>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                        {student.certificates && student.certificates.length > 0 ? (
                                            student.certificates.map((cert: any, i: number) => (
                                                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                                                    <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{cert.title}</div>
                                                    <div style={{ fontSize: "0.85rem", color: "#666" }}>{cert.issuer}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ fontSize: "0.9rem", color: "#444" }}>Verified Platform Streaks & Participation Achievement</div>
                                        )}
                                        {student.badges.map((b, i) => (
                                            <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                                                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{b.title}</div>
                                                <div style={{ fontSize: "0.85rem", color: "#666" }}>{b.date}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </main>

                            {/* RIGHT COLUMN */}
                            <aside>
                                <section style={{ marginBottom: 35 }}>
                                    <h2 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#111", textTransform: "uppercase", marginBottom: 15, borderBottom: "2px solid #3B82F6", display: "inline-block" }}>Verified Metrics</h2>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                                        <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8 }}>
                                            <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>LeetCode Rank</div>
                                            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b" }}>#{student.leetcodeRank}</div>
                                        </div>
                                        <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8 }}>
                                            <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>GitHub Activity</div>
                                            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b" }}>{student.githubStreak} Day Streak</div>
                                        </div>
                                        <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8 }}>
                                            <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Attendance</div>
                                            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b" }}>{student.attendance}%</div>
                                        </div>
                                        <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8 }}>
                                            <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Career Match</div>
                                            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#3B82F6" }}>{student.careerProbability}%</div>
                                        </div>
                                    </div>
                                </section>

                                <section style={{ marginBottom: 35 }}>
                                    <h2 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#111", textTransform: "uppercase", marginBottom: 15, borderBottom: "2px solid #3B82F6", display: "inline-block" }}>Education</h2>
                                    <div style={{ fontSize: "0.9rem" }}>
                                        <div style={{ fontWeight: 800 }}>Bachelor of Technology</div>
                                        <div style={{ color: "#666" }}>{student.department}</div>
                                        <div style={{ color: "#3B82F6", fontWeight: 600 }}>2021 — 2025</div>
                                        <div style={{ marginTop: 8, fontSize: "0.8rem", lineHeight: 1.4 }}>{student.college}</div>
                                    </div>
                                </section>

                                <section>
                                    <h2 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#111", textTransform: "uppercase", marginBottom: 15, borderBottom: "2px solid #3B82F6", display: "inline-block" }}>Connect</h2>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.85rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <Github size={14} /> github.com/{student.githubUsername}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <Trophy size={14} /> leetcode.com/{student.leetcodeUsername}
                                        </div>
                                    </div>
                                </section>
                            </aside>
                        </div>
                        
                        <footer style={{ marginTop: 50, paddingTop: 15, borderTop: "1px solid #eee", textAlign: "center", fontSize: "0.75rem", color: "#999" }}>
                            Verified by Skill GPS Academic Analytics Framework
                        </footer>
                    </div>
                </>
            ) : (
                <div style={{ animation: "fadeIn 0.4s ease" }}>
                    <div className="glass-card" style={{ padding: 40, textAlign: "center", border: "2px dashed var(--border-color)", background: "rgba(59, 130, 246, 0.02)" }}>
                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "1px solid var(--border-color)" }}>
                            <Upload size={28} color="#3B82F6" />
                        </div>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }}>Upload Existing Resume</h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
                            Upload your PDF resume to get an instant ATS score and AI-powered optimization tips for <strong>{student.careerTarget}</strong> roles.
                        </p>
                        
                        <label style={{ 
                            display: "inline-flex", alignItems: "center", gap: 10, background: "var(--accent-primary, #3B82F6)", color: "white", 
                            padding: "12px 28px", borderRadius: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" 
                        }} className="hover-scale">
                            {isOptimizing ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                            {isOptimizing ? "Analyzing Resume..." : "Select PDF File"}
                            <input type="file" accept=".pdf" onChange={handleOptimize} style={{ display: "none" }} disabled={isOptimizing} />
                        </label>

                        {uploadError && (
                            <div style={{ marginTop: 20, color: "#ef4444", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                                <AlertCircle size={16} /> {uploadError}
                            </div>
                        )}
                    </div>

                    {optimizationData && (
                        <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32, animation: "fadeIn 0.5s ease" }}>
                            {/* SCORE COLUMN */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                <div className="glass-card" style={{ padding: 32, textAlign: "center" }}>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Overall ATS Score</div>
                                    <div style={{ fontSize: "4rem", fontWeight: 900, color: optimizationData.atsScore >= 80 ? "#39d353" : "#f59e0b", letterSpacing: "-2px" }}>
                                        {optimizationData.atsScore}<span style={{ fontSize: "1.5rem", color: "var(--text-muted)" }}>/100</span>
                                    </div>
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 10 }}>
                                        {optimizationData.atsScore >= 80 ? "Excellent! Your resume is highly optimized." : "Room for improvement to beat the ATS bots."}
                                    </p>
                                </div>

                                <div className="glass-card" style={{ padding: 24 }}>
                                    <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 16, textTransform: "uppercase" }}>Category Breakdown</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        {optimizationData.breakdown.map((item: any, i: number) => (
                                            <div key={i}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 6 }}>
                                                    <span style={{ color: "var(--text-secondary)" }}>{item.category}</span>
                                                    <span style={{ fontWeight: 700 }}>{item.score}%</span>
                                                </div>
                                                <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
                                                    <div style={{ width: `${item.score}%`, height: "100%", background: "#3B82F6", borderRadius: 10 }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* SUGGESTIONS COLUMN */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                <div className="glass-card" style={{ padding: 32 }}>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                                        <Sparkles size={20} color="#3B82F6" /> AI Suggestions
                                    </h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                        {optimizationData.suggestions.map((s: string, i: number) => (
                                            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid var(--border-color)" }}>
                                                <CheckCircle2 size={18} color="#39d353" style={{ flexShrink: 0, marginTop: 2 }} />
                                                <span style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>{s}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginTop: 32, marginBottom: 16, color: "#ef4444", display: "flex", alignItems: "center", gap: 10 }}>
                                        <XCircle size={20} /> Missing Keywords
                                    </h3>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {optimizationData.missingKeywords.map((k: string, i: number) => (
                                            <span key={i} style={{ padding: "4px 12px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: 6, fontSize: "0.85rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>{k}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass-card" style={{ padding: 32 }}>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Recommended Professional Summary</h3>
                                    <div style={{ padding: 20, background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: 12, fontSize: "0.95rem", lineHeight: 1.6, fontStyle: "italic", color: "var(--text-secondary)" }}>
                                        &ldquo;{optimizationData.rewrittenSummary}&rdquo;
                                    </div>
                                    <button 
                                        className="btn-primary" 
                                        style={{ marginTop: 20, width: "100%", padding: 12, borderRadius: 10, fontSize: "0.9rem" }}
                                        onClick={() => {
                                            navigator.clipboard.writeText(optimizationData.rewrittenSummary);
                                            alert("Summary copied to clipboard!");
                                        }}
                                    >
                                        Copy Rewritten Summary
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    .resume-container { box-shadow: none !important; border: none !important; margin: 0 !important; width: 100% !important; max-width: none !important; padding: 0 !important; }
                    @page { margin: 1cm; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
