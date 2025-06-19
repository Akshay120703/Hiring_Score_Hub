import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRubricSchema, insertCandidateSchema, insertEvaluationSchema } from "@shared/schema";
import multer from "multer";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

interface MulterRequest extends Express.Request {
  file?: MulterFile;
}
import { promises as fs } from "fs";
import path from "path";

const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Rubrics routes
  app.get("/api/rubrics", async (req, res) => {
    try {
      const rubrics = await storage.getRubrics();
      res.json(rubrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rubrics" });
    }
  });

  app.get("/api/rubrics/:id", async (req, res) => {
    try {
      const rubric = await storage.getRubric(parseInt(req.params.id));
      if (!rubric) {
        return res.status(404).json({ message: "Rubric not found" });
      }
      res.json(rubric);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rubric" });
    }
  });

  app.post("/api/rubrics", async (req, res) => {
    try {
      const validatedData = insertRubricSchema.parse(req.body);
      const rubric = await storage.createRubric(validatedData);
      res.status(201).json(rubric);
    } catch (error) {
      res.status(400).json({ message: "Invalid rubric data", error: error.message });
    }
  });

  app.put("/api/rubrics/:id", async (req, res) => {
    try {
      const validatedData = insertRubricSchema.partial().parse(req.body);
      const rubric = await storage.updateRubric(parseInt(req.params.id), validatedData);
      if (!rubric) {
        return res.status(404).json({ message: "Rubric not found" });
      }
      res.json(rubric);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid rubric data", error: error.message });
    }
  });

  app.delete("/api/rubrics/:id", async (req, res) => {
    try {
      const success = await storage.deleteRubric(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Rubric not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete rubric" });
    }
  });

  // Import rubric from CSV/JSON
  app.post("/api/rubrics/import", upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileContent = await fs.readFile(req.file.path, 'utf-8');
      let rubricData;

      if (req.file.mimetype === 'application/json') {
        rubricData = JSON.parse(fileContent);
      } else if (req.file.mimetype === 'text/csv') {
        // Simple CSV parsing for rubrics
        const lines = fileContent.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        if (!headers.includes('name') || !headers.includes('description')) {
          return res.status(400).json({ message: "CSV must include 'name' and 'description' columns" });
        }

        const data = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim();
          });
          return obj;
        });

        rubricData = {
          name: data[0]?.name || 'Imported Rubric',
          description: data[0]?.description || 'Imported from CSV',
          categories: [
            {
              id: "general",
              name: "General Criteria",
              icon: "clipboard",
              color: "#2E86AB",
              criteria: data.map((item, index) => ({
                id: `criteria-${index}`,
                name: item.name || `Criterion ${index + 1}`,
                maxScore: parseInt(item.maxScore) || 10,
                weight: 1
              }))
            }
          ],
          maxScore: data.reduce((sum, item) => sum + (parseInt(item.maxScore) || 10), 0)
        };
      } else {
        return res.status(400).json({ message: "Unsupported file type. Please upload JSON or CSV" });
      }

      const validatedData = insertRubricSchema.parse(rubricData);
      const rubric = await storage.createRubric(validatedData);

      // Clean up uploaded file
      await fs.unlink(req.file.path);

      res.status(201).json(rubric);
    } catch (error: any) {
      res.status(400).json({ message: "Failed to import rubric", error: error.message });
    }
  });

  // Candidates routes
  app.get("/api/candidates", async (req, res) => {
    try {
      const candidates = await storage.getCandidatesWithEvaluations();
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  app.get("/api/candidates/:id", async (req, res) => {
    try {
      const candidate = await storage.getCandidate(parseInt(req.params.id));
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch candidate" });
    }
  });

  app.post("/api/candidates", async (req, res) => {
    try {
      const validatedData = insertCandidateSchema.parse(req.body);
      const candidate = await storage.createCandidate(validatedData);
      res.status(201).json(candidate);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid candidate data", error: error.message });
    }
  });

  app.put("/api/candidates/:id", async (req, res) => {
    try {
      const validatedData = insertCandidateSchema.partial().parse(req.body);
      const candidate = await storage.updateCandidate(parseInt(req.params.id), validatedData);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid candidate data", error: error.message });
    }
  });

  app.delete("/api/candidates/:id", async (req, res) => {
    try {
      const success = await storage.deleteCandidate(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete candidate" });
    }
  });

  // Evaluations routes
  app.get("/api/evaluations", async (req, res) => {
    try {
      const evaluations = await storage.getEvaluations();
      res.json(evaluations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch evaluations" });
    }
  });

  app.get("/api/evaluations/:id", async (req, res) => {
    try {
      const evaluation = await storage.getEvaluation(parseInt(req.params.id));
      if (!evaluation) {
        return res.status(404).json({ message: "Evaluation not found" });
      }
      res.json(evaluation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch evaluation" });
    }
  });

  app.post("/api/evaluations", async (req, res) => {
    try {
      const validatedData = insertEvaluationSchema.parse(req.body);
      const evaluation = await storage.createEvaluation(validatedData);
      res.status(201).json(evaluation);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid evaluation data", error: error.message });
    }
  });

  app.put("/api/evaluations/:id", async (req, res) => {
    try {
      const validatedData = insertEvaluationSchema.partial().parse(req.body);
      const evaluation = await storage.updateEvaluation(parseInt(req.params.id), validatedData);
      if (!evaluation) {
        return res.status(404).json({ message: "Evaluation not found" });
      }
      res.json(evaluation);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid evaluation data", error: error.message });
    }
  });

  app.delete("/api/evaluations/:id", async (req, res) => {
    try {
      const success = await storage.deleteEvaluation(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Evaluation not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete evaluation" });
    }
  });

  // Export data
  app.get("/api/export/evaluations", async (req, res) => {
    try {
      const evaluations = await storage.getEvaluations();
      
      // Convert to CSV format
      const csvHeaders = [
        'Evaluation ID',
        'Candidate Name',
        'Candidate Email',
        'Position',
        'Rubric Name',
        'Overall Score',
        'Status',
        'Evaluator',
        'Created At'
      ];

      const csvRows = evaluations.map(evaluation => [
        evaluation.id,
        evaluation.candidate.name,
        evaluation.candidate.email,
        evaluation.candidate.position,
        evaluation.rubric.name,
        evaluation.overallScore,
        evaluation.status,
        evaluation.evaluatorName,
        evaluation.createdAt.toISOString()
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="evaluations.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export evaluations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
