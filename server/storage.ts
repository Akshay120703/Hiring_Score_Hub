import { 
  rubrics, 
  candidates, 
  evaluations,
  type Rubric, 
  type Candidate, 
  type Evaluation,
  type InsertRubric, 
  type InsertCandidate, 
  type InsertEvaluation,
  type EvaluationWithDetails,
  type CandidateWithEvaluations,
  type DashboardStats,
  type RubricCategory
} from "@shared/schema";

export interface IStorage {
  // Rubrics
  getRubrics(): Promise<Rubric[]>;
  getRubric(id: number): Promise<Rubric | undefined>;
  createRubric(rubric: InsertRubric): Promise<Rubric>;
  updateRubric(id: number, rubric: Partial<InsertRubric>): Promise<Rubric | undefined>;
  deleteRubric(id: number): Promise<boolean>;

  // Candidates
  getCandidates(): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: number): Promise<boolean>;

  // Evaluations
  getEvaluations(): Promise<EvaluationWithDetails[]>;
  getEvaluation(id: number): Promise<EvaluationWithDetails | undefined>;
  getEvaluationsByCandidate(candidateId: number): Promise<EvaluationWithDetails[]>;
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  updateEvaluation(id: number, evaluation: Partial<InsertEvaluation>): Promise<Evaluation | undefined>;
  deleteEvaluation(id: number): Promise<boolean>;

  // Analytics
  getDashboardStats(): Promise<DashboardStats>;
  getCandidatesWithEvaluations(): Promise<CandidateWithEvaluations[]>;
}

export class MemStorage implements IStorage {
  private rubrics: Map<number, Rubric> = new Map();
  private candidates: Map<number, Candidate> = new Map();
  private evaluations: Map<number, Evaluation> = new Map();
  private currentRubricId = 1;
  private currentCandidateId = 1;
  private currentEvaluationId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some initial rubrics
    const technicalRubric: Rubric = {
      id: this.currentRubricId++,
      name: "Technical Interview",
      description: "Comprehensive technical assessment for software engineers",
      categories: [
        {
          id: "coding",
          name: "Coding Skills",
          icon: "code",
          color: "#2E86AB",
          criteria: [
            { id: "problem-solving", name: "Problem Solving", maxScore: 10, weight: 1 },
            { id: "code-quality", name: "Code Quality", maxScore: 10, weight: 1 }
          ]
        },
        {
          id: "logic",
          name: "Logical Reasoning",
          icon: "brain",
          color: "#A23B72",
          criteria: [
            { id: "analytical-thinking", name: "Analytical Thinking", maxScore: 10, weight: 1 }
          ]
        },
        {
          id: "communication",
          name: "Communication",
          icon: "comments",
          color: "#28A745",
          criteria: [
            { id: "clarity", name: "Clarity & Articulation", maxScore: 10, weight: 1 }
          ]
        }
      ],
      maxScore: 40,
      createdAt: new Date(),
    };

    const behaviorRubric: Rubric = {
      id: this.currentRubricId++,
      name: "Behavior Assessment",
      description: "Evaluates soft skills and team fit",
      categories: [
        {
          id: "teamwork",
          name: "Teamwork",
          icon: "users",
          color: "#2E86AB",
          criteria: [
            { id: "collaboration", name: "Collaboration", maxScore: 10, weight: 1 },
            { id: "leadership", name: "Leadership", maxScore: 10, weight: 1 }
          ]
        },
        {
          id: "adaptability",
          name: "Adaptability",
          icon: "refresh",
          color: "#A23B72",
          criteria: [
            { id: "flexibility", name: "Flexibility", maxScore: 10, weight: 1 }
          ]
        }
      ],
      maxScore: 30,
      createdAt: new Date(),
    };

    this.rubrics.set(technicalRubric.id, technicalRubric);
    this.rubrics.set(behaviorRubric.id, behaviorRubric);

    // Seed some candidates
    const candidatesData = [
      { name: "Sarah Johnson", email: "sarah.johnson@email.com", position: "Frontend Developer" },
      { name: "Michael Chen", email: "michael.chen@email.com", position: "Backend Developer" },
      { name: "Emily Rodriguez", email: "emily.rodriguez@email.com", position: "Full Stack Developer" },
      { name: "David Kim", email: "david.kim@email.com", position: "DevOps Engineer" }
    ];

    candidatesData.forEach(candidateData => {
      const candidate: Candidate = {
        id: this.currentCandidateId++,
        ...candidateData,
        createdAt: new Date(),
      };
      this.candidates.set(candidate.id, candidate);
    });

    // Seed some evaluations
    const evaluationsData = [
      {
        candidateId: 1,
        rubricId: 1,
        scores: { "problem-solving": 8, "code-quality": 7, "analytical-thinking": 8, "clarity": 9 },
        overallScore: "8.0",
        evaluatorName: "John Doe",
        status: "completed" as const
      },
      {
        candidateId: 2,
        rubricId: 1,
        scores: { "problem-solving": 9, "code-quality": 9, "analytical-thinking": 9, "clarity": 7 },
        overallScore: "8.5",
        evaluatorName: "John Doe",
        status: "completed" as const
      }
    ];

    evaluationsData.forEach(evalData => {
      const evaluation: Evaluation = {
        id: this.currentEvaluationId++,
        ...evalData,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.evaluations.set(evaluation.id, evaluation);
    });
  }

  // Rubrics
  async getRubrics(): Promise<Rubric[]> {
    return Array.from(this.rubrics.values());
  }

  async getRubric(id: number): Promise<Rubric | undefined> {
    return this.rubrics.get(id);
  }

  async createRubric(rubric: InsertRubric): Promise<Rubric> {
    const id = this.currentRubricId++;
    const newRubric: Rubric = {
      id,
      name: rubric.name,
      description: rubric.description || null,
      categories: rubric.categories,
      maxScore: rubric.maxScore,
      createdAt: new Date(),
    };
    this.rubrics.set(id, newRubric);
    return newRubric;
  }

  async updateRubric(id: number, rubric: Partial<InsertRubric>): Promise<Rubric | undefined> {
    const existing = this.rubrics.get(id);
    if (!existing) return undefined;

    const updated: Rubric = { 
      ...existing, 
      ...rubric,
      description: rubric.description !== undefined ? rubric.description : existing.description
    };
    this.rubrics.set(id, updated);
    return updated;
  }

  async deleteRubric(id: number): Promise<boolean> {
    return this.rubrics.delete(id);
  }

  // Candidates
  async getCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const id = this.currentCandidateId++;
    const newCandidate: Candidate = {
      ...candidate,
      id,
      createdAt: new Date(),
    };
    this.candidates.set(id, newCandidate);
    return newCandidate;
  }

  async updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const existing = this.candidates.get(id);
    if (!existing) return undefined;

    const updated: Candidate = { ...existing, ...candidate };
    this.candidates.set(id, updated);
    return updated;
  }

  async deleteCandidate(id: number): Promise<boolean> {
    return this.candidates.delete(id);
  }

  // Evaluations
  async getEvaluations(): Promise<EvaluationWithDetails[]> {
    const evaluations = Array.from(this.evaluations.values());
    return evaluations.map(evaluation => ({
      ...evaluation,
      candidate: this.candidates.get(evaluation.candidateId)!,
      rubric: this.rubrics.get(evaluation.rubricId)!,
    }));
  }

  async getEvaluation(id: number): Promise<EvaluationWithDetails | undefined> {
    const evaluation = this.evaluations.get(id);
    if (!evaluation) return undefined;

    return {
      ...evaluation,
      candidate: this.candidates.get(evaluation.candidateId)!,
      rubric: this.rubrics.get(evaluation.rubricId)!,
    };
  }

  async getEvaluationsByCandidate(candidateId: number): Promise<EvaluationWithDetails[]> {
    const evaluations = Array.from(this.evaluations.values())
      .filter(evaluation => evaluation.candidateId === candidateId);
    
    return evaluations.map(evaluation => ({
      ...evaluation,
      candidate: this.candidates.get(evaluation.candidateId)!,
      rubric: this.rubrics.get(evaluation.rubricId)!,
    }));
  }

  async createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation> {
    const id = this.currentEvaluationId++;
    const newEvaluation: Evaluation = {
      id,
      candidateId: evaluation.candidateId,
      rubricId: evaluation.rubricId,
      scores: evaluation.scores,
      overallScore: evaluation.overallScore,
      notes: evaluation.notes || null,
      evaluatorName: evaluation.evaluatorName,
      status: evaluation.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.evaluations.set(id, newEvaluation);
    return newEvaluation;
  }

  async updateEvaluation(id: number, evaluation: Partial<InsertEvaluation>): Promise<Evaluation | undefined> {
    const existing = this.evaluations.get(id);
    if (!existing) return undefined;

    const updated: Evaluation = { 
      ...existing, 
      ...evaluation,
      updatedAt: new Date(),
    };
    this.evaluations.set(id, updated);
    return updated;
  }

  async deleteEvaluation(id: number): Promise<boolean> {
    return this.evaluations.delete(id);
  }

  // Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    const evaluations = Array.from(this.evaluations.values());
    const completedEvaluations = evaluations.filter(e => e.status === 'completed');
    
    const totalScore = completedEvaluations.reduce((sum, e) => sum + parseFloat(e.overallScore), 0);
    const averageScore = completedEvaluations.length > 0 ? totalScore / completedEvaluations.length : 0;
    
    const passRate = completedEvaluations.length > 0 
      ? (completedEvaluations.filter(e => parseFloat(e.overallScore) >= 7).length / completedEvaluations.length) * 100
      : 0;

    return {
      activeAssessments: evaluations.filter(e => e.status === 'draft').length,
      candidatesEvaluated: new Set(completedEvaluations.map(e => e.candidateId)).size,
      averageScore: Math.round(averageScore * 10) / 10,
      passRate: Math.round(passRate),
    };
  }

  async getCandidatesWithEvaluations(): Promise<CandidateWithEvaluations[]> {
    const candidates = Array.from(this.candidates.values());
    
    return candidates.map(candidate => {
      const candidateEvaluations = Array.from(this.evaluations.values())
        .filter(evaluation => evaluation.candidateId === candidate.id)
        .map(evaluation => ({
          ...evaluation,
          candidate,
          rubric: this.rubrics.get(evaluation.rubricId)!,
        }));

      const completedEvaluations = candidateEvaluations.filter(e => e.status === 'completed');
      const averageScore = completedEvaluations.length > 0
        ? completedEvaluations.reduce((sum, e) => sum + parseFloat(e.overallScore), 0) / completedEvaluations.length
        : undefined;

      return {
        ...candidate,
        evaluations: candidateEvaluations,
        averageScore: averageScore ? Math.round(averageScore * 10) / 10 : undefined,
      };
    });
  }
}

export const storage = new MemStorage();
